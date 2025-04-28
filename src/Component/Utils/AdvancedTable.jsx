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

export default function AdvancedTable({
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
                                          onView = null,    // ✅ now accepting onView
                                      }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [columnFilters, setColumnFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState(null);
    const [sortDir, setSortDir] = useState("asc");
    const itemsPerPage = 10;

    const handleColumnFilterChange = (accessor, value) => {
        setColumnFilters((prev) => ({...prev, [accessor]: value}));
    };

    const filtered = useMemo(() => {
        let filteredData = data;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredData = filteredData.filter((row) =>
                columns.some((col) => {
                    const val = row[col.accessor];
                    if (Array.isArray(val)) {
                        return val.some((v) => v.toString().toLowerCase().includes(term));
                    }
                    return val != null && val.toString().toLowerCase().includes(term);
                })
            );
        }

        Object.keys(columnFilters).forEach((accessor) => {
            const filterValue = columnFilters[accessor]?.toLowerCase();
            if (filterValue) {
                filteredData = filteredData.filter((row) => {
                    const val = row[accessor];
                    if (Array.isArray(val)) {
                        return val.some((v) => v.toString().toLowerCase().includes(filterValue));
                    }
                    return val != null && val.toString().toLowerCase().includes(filterValue);
                });
            }
        });

        return filteredData;
    }, [data, searchTerm, columnFilters, columns]);

    const sorted = useMemo(() => {
        if (!sortBy) return filtered;
        const dir = sortDir === "asc" ? 1 : -1;
        return [...filtered].sort((a, b) => {
            let va = a[sortBy];
            let vb = b[sortBy];

            if (Array.isArray(va)) va = va.length;
            if (Array.isArray(vb)) vb = vb.length;

            if (typeof va === "string" && ["High", "Medium", "Low"].includes(va)) {
                const priorityOrder = {High: 1, Medium: 2, Low: 3};
                return (priorityOrder[va] - priorityOrder[vb]) * dir;
            }

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
    useEffect(() => setCurrentPage(1), [searchTerm, columnFilters, sortBy, sortDir]);

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
            columns.map((c) => {
                let val = row[c.accessor];
                if (Array.isArray(val)) {
                    return `"${val.map(v => JSON.stringify(v)).join(", ")}"`;
                }
                const str = val != null ? String(val) : "";
                return `"${str.replace(/"/g, '""')}"`;
            }).join(",")
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
                <h3 className="text-2xl font-bold mb-4 text-gray-800">{title}</h3>
            )}

            {/* Top controls */}
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="Search all..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 mr-2 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
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
                        <TableRow className="bg-gray-200 text-gray-700">
                            {columns.map((col) => (
                                <TableHead
                                    key={col.accessor}
                                    onClick={() => handleSort(col.accessor)}
                                    className="cursor-pointer"
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
                                <TableHead key={col.accessor}>
                                    <input
                                        type="text"
                                        placeholder={`Filter ${col.header}`}
                                        value={columnFilters[col.accessor] || ""}
                                        onChange={(e) => handleColumnFilterChange(col.accessor, e.target.value)}
                                        className="w-full text-xs border rounded p-1"
                                    />
                                </TableHead>
                            ))}
                            {canEdit && <TableHead></TableHead>}
                            {canDelete && <TableHead></TableHead>}
                        </TableRow>
                    </TableHeader>

                    {/* Body */}
                    <TableBody>
                        {paginated.map((row, rowIdx) => {
                            const originalIdx = (currentPage - 1) * itemsPerPage + rowIdx;
                            const rowKey = row.id ?? `${rowIdx}-${JSON.stringify(row).slice(0, 20)}`;

                            return (
                                <TableRow
                                    key={rowKey}
                                    className="hover:bg-gray-100 cursor-pointer"
                                    onClick={() => onView && onView(row)} // ✅ Add this for View Modal
                                >
                                    {columns.map((col) => (
                                        <TableCell key={col.accessor} className="px-4 py-2">
                                            {Array.isArray(row[col.accessor]) ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {row[col.accessor].map((item, tagIdx) =>
                                                            typeof item === "object" ? (
                                                                <div key={tagIdx}
                                                                     className="p-2 border rounded bg-gray-50 text-xs">
                                                                    <div><b>Subpart:</b> {item.project_subpart_name}</div>
                                                                    <div><b>Deadline:</b> {item.dead_line}</div>
                                                                    <div><b>Hours:</b> {item.hours_elapsed ?? 0}</div>
                                                                    <div><b>Done:</b> {item.is_done ? "✅" : "❌"}</div>
                                                                </div>
                                                            ) : (
                                                                <span key={tagIdx}
                                                                      className="bg-blue-100 px-2 py-1 rounded-full text-xs">
                                {item}
                              </span>
                                                            )
                                                    )}
                                                </div>
                                            ) : col.render ? (
                                                col.render(row, originalIdx)
                                            ) : (
                                                row[col.accessor] ?? "N/A"
                                            )}
                                        </TableCell>
                                    ))}
                                    {canEdit && (
                                        <TableCell className="text-center">
                                            <Button size="sm" variant="outline"
                                                    onClick={() => onEdit(row, originalIdx)}>
                                                Edit
                                            </Button>
                                        </TableCell>
                                    )}
                                    {canDelete && (
                                        <TableCell className="text-center">
                                            <Button size="sm" variant="destructive"
                                                    onClick={() => onDelete(row, originalIdx)}>
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
                                    <TableCell key={`footer-${idx}`}>{label.content}</TableCell>
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