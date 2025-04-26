// src/Component/Utils/CommonTable.jsx
import React, {useState, useEffect, useMemo} from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {Button} from "@/components/ui/Button";

export default function CommonTable({
                                        title,
                                        caption,
                                        columns,
                                        data,
                                        footer,
                                        userRole = null,    // current user’s role
                                        editRoles = [],     // roles allowed to see “Edit”
                                        deleteRoles = [],   // roles allowed to see “Delete”
                                        onEdit = null,      // (row, idx) => {}
                                        onDelete = null,    // (row, idx) => {}
                                    }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState(null);
    const [sortDir, setSortDir] = useState("asc"); // or "desc"
    const itemsPerPage = 10;

    // filter step
    const filtered = useMemo(() => {
        if (!searchTerm) return data;
        const term = searchTerm.toLowerCase();
        return data.filter((row) =>
            columns.some((col) => {
                const val = row[col.accessor];
                return (
                    val != null &&
                    val
                        .toString()
                        .toLowerCase()
                        .includes(term)
                );
            })
        );
    }, [data, searchTerm, columns]);

    // sort step
    const sorted = useMemo(() => {
        if (!sortBy) return filtered;
        const dir = sortDir === "asc" ? 1 : -1;
        return [...filtered].sort((a, b) => {
            const va = a[sortBy];
            const vb = b[sortBy];
            // handle null/undefined
            if (va == null && vb == null) return 0;
            if (va == null) return -1 * dir;
            if (vb == null) return 1 * dir;
            // numeric?
            if (!isNaN(va) && !isNaN(vb)) {
                return (parseFloat(va) - parseFloat(vb)) * dir;
            }
            // string compare
            return va.toString().localeCompare(vb.toString()) * dir;
        });
    }, [filtered, sortBy, sortDir]);

    // pagination step
    const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
    useEffect(() => setCurrentPage(1), [searchTerm, sortBy, sortDir]);
    const paginated = useMemo(
        () =>
            sorted.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
            ),
        [sorted, currentPage]
    );

    const canEdit = onEdit && editRoles.includes(userRole);
    const canDelete = onDelete && deleteRoles.includes(userRole);

    const handlePrevious = () =>
        setCurrentPage((p) => Math.max(1, p - 1));
    const handleNext = () =>
        setCurrentPage((p) => Math.min(totalPages, p + 1));

    const handleSort = (accessor) => {
        if (sortBy === accessor) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(accessor);
            setSortDir("asc");
        }
    };

    // CSV export (includes filtering+sorting, not just current page)
    const downloadCSV = () => {
        const headers = columns.map((c) => c.header);
        const rowsCsv = sorted.map((row) =>
            columns
                .map((c) => {
                    const val = row[c.accessor];
                    const str = val != null ? String(val) : "";
                    return `"${str.replace(/"/g, '""')}"`;
                })
                .join(",")
        );
        const csv = [headers.join(","), ...rowsCsv].join("\n");
        const blob = new Blob([csv], {type: "text/csv"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title || "export"}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="py-4">
            {title && (
                <h3 className="text-xl font-semibold mt-6 mb-2 text-black">
                    {title}
                </h3>
            )}

            {/* Search & Download */}
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 mr-2 px-4 py-2 border rounded-md"
                />
                <button
                    onClick={downloadCSV}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Download CSV
                </button>
            </div>

            <div className="overflow-x-auto bg-white shadow-md rounded-md">
                <Table className="min-w-full bg-white">
                    {caption && <TableCaption>{caption}</TableCaption>}

                    <TableHeader>
                        <TableRow className="bg-gray-200 text-gray-800">
                            {columns.map((col) => (
                                <TableHead
                                    key={col.accessor}
                                    className="px-4 py-2 cursor-pointer select-none"
                                    onClick={() => handleSort(col.accessor)}
                                >
                                    {col.header}{" "}
                                    {sortBy === col.accessor && (sortDir === "asc" ? "▲" : "▼")}
                                </TableHead>
                            ))}
                            {canEdit && (
                                <TableHead className="px-4 py-2 text-center">
                                    Edit
                                </TableHead>
                            )}
                            {canDelete && (
                                <TableHead className="px-4 py-2 text-center">
                                    Delete
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginated.map((row, rowIdx) => {
                            const originalIdx =
                                (currentPage - 1) * itemsPerPage + rowIdx;
                            const rowKey =
                                row.id ?? `${rowIdx}-${JSON.stringify(row).slice(0, 20)}`;

                            return (
                                <TableRow
                                    key={rowKey}
                                    className="hover:bg-gray-300 transition-colors duration-150"
                                >
                                    {columns.map((col) => (
                                        <TableCell
                                            key={col.accessor}
                                            className="px-4 py-2"
                                        >
                                            {col.render
                                                ? col.render(row, originalIdx)
                                                : row[col.accessor] ?? "N/A"}
                                        </TableCell>
                                    ))}
                                    {canEdit && (
                                        <TableCell className="px-4 py-2 text-center">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onEdit(row, originalIdx)}
                                            >
                                                Edit
                                            </Button>
                                        </TableCell>
                                    )}
                                    {canDelete && (
                                        <TableCell className="px-4 py-2 text-center">
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => onDelete(row, originalIdx)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>

                    {footer?.totalLabels && (
                        <TableFooter>
                            <TableRow>
                                {footer.totalLabels.map((label, idx) => (
                                    <TableCell key={`footer-${idx}`}>
                                        {label.content}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 px-4">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
                <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}