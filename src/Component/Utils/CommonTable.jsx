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
import MultiSelectFilter from "@/Component/Utils/MultiSelectFilter.jsx";

export default function CommonTable({
                                        title,
                                        caption,
                                        columns,
                                        data,
                                        footer,
                                        userRole = null,
                                        editRoles = [],
                                        deleteRoles = [],
                                        onEdit = null,
                                        onDelete = null,
                                    }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [columnFilters, setColumnFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState(null);
    const [sortDir, setSortDir] = useState("asc");
    const itemsPerPage = 20;

    const filtered = useMemo(() => {
        let filteredData = data;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredData = filteredData.filter((row) =>
                columns.some((col) => {
                    const val = row[col.accessor];
                    return (
                        val != null &&
                        val.toString().toLowerCase().includes(term)
                    );
                })
            );
        }

        Object.keys(columnFilters).forEach((accessor) => {
            const filter = columnFilters[accessor];
            const columnDef = columns.find((col) => col.accessor === accessor);

            if (filter) {
                filteredData = filteredData.filter((row) => {
                    const val = row[accessor];
                    if (columnDef?.filterType === "multi-select") {
                        if (!Array.isArray(filter)) return true;
                        if (filter.length === 0) return true;
                        if (accessor === "is_done") {
                            return (val ? "Done" : "Not Done") && filter.includes(val ? "Done" : "Not Done");
                        }
                        return filter.includes(val);
                    } else {
                        return (
                            val != null &&
                            val.toString().toLowerCase().includes(filter.toLowerCase())
                        );
                    }
                });
            }
        });

        return filteredData;
    }, [data, searchTerm, columnFilters, columns]);

    const sorted = useMemo(() => {
        if (!sortBy) return filtered;
        const dir = sortDir === "asc" ? 1 : -1;
        return [...filtered].sort((a, b) => {
            const va = a[sortBy];
            const vb = b[sortBy];

            if (va == null && vb == null) return 0;
            if (va == null) return -1 * dir;
            if (vb == null) return 1 * dir;

            if (!isNaN(va) && !isNaN(vb)) {
                return (parseFloat(va) - parseFloat(vb)) * dir;
            }

            return va.toString().localeCompare(vb.toString()) * dir;
        });
    }, [filtered, sortBy, sortDir]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
    useEffect(() => setCurrentPage(1), [searchTerm, sortBy, sortDir, columnFilters]);
    const paginated = useMemo(
        () => sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
        [sorted, currentPage]
    );

    const canEdit = onEdit && editRoles.includes(userRole);
    const canDelete = onDelete && deleteRoles.includes(userRole);

    const handlePrevious = () => setCurrentPage((p) => Math.max(1, p - 1));
    const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

    const handleSort = (accessor) => {
        if (sortBy === accessor) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(accessor);
            setSortDir("asc");
        }
    };

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
                <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
            )}

            {/* Global Search + Download */}
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="Search all..."
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

            {/* Table */}
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <Table className="min-w-full bg-white">
                    {caption && <TableCaption>{caption}</TableCaption>}

                    {/* Headers */}
                    <TableHeader>
                        <TableRow className="bg-gray-200 text-gray-800">
                            {columns.map((col) => (
                                <TableHead
                                    key={col.accessor}
                                    className="px-4 py-2 cursor-pointer"
                                    onClick={() => handleSort(col.accessor)}
                                >
                                    {col.header} {sortBy === col.accessor && (sortDir === "asc" ? "▲" : "▼")}
                                </TableHead>
                            ))}
                            {canEdit && <TableHead>Edit</TableHead>}
                            {canDelete && <TableHead>Delete</TableHead>}
                        </TableRow>

                        {/* Filters */}
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={col.accessor} className="text-center">
                                    {col.filterType === "multi-select" ? (
                                        <MultiSelectFilter
                                            options={col.options || []}
                                            selectedValues={columnFilters[col.accessor] || []}
                                            onChange={(selected) => setColumnFilters((prev) => ({
                                                ...prev,
                                                [col.accessor]: selected
                                            }))}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder={`Filter ${col.header}`}
                                            value={columnFilters[col.accessor] || ""}
                                            onChange={(e) => setColumnFilters((prev) => ({
                                                ...prev,
                                                [col.accessor]: e.target.value
                                            }))}
                                            className="w-full p-1 text-xs border rounded"
                                        />
                                    )}
                                </TableHead>
                            ))}
                            {canEdit && <TableHead/>}
                            {canDelete && <TableHead/>}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginated.map((row, idx) => {
                            const key = row.id ?? `${idx}-${JSON.stringify(row).slice(0, 20)}`;
                            return (
                                <TableRow key={key}>
                                    {columns.map((col) => (
                                        <TableCell key={col.accessor}>
                                            {col.render ? col.render(row, idx) : row[col.accessor] ?? "N/A"}
                                        </TableCell>
                                    ))}
                                    {canEdit && (
                                        <TableCell className="text-center">
                                            <Button size="sm" variant="outline" onClick={() => onEdit(row, idx)}>
                                                Edit
                                            </Button>
                                        </TableCell>
                                    )}
                                    {canDelete && (
                                        <TableCell className="text-center">
                                            <Button size="sm" variant="destructive" onClick={() => onDelete(row, idx)}>
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
                                    <TableCell key={idx}>{label.content}</TableCell>
                                ))}
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 px-4">
                <Button variant="outline" onClick={handlePrevious} disabled={currentPage === 1}>
                    Previous
                </Button>
                <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
                <Button variant="outline" onClick={handleNext} disabled={currentPage === totalPages}>
                    Next
                </Button>
            </div>
        </div>
    );
}