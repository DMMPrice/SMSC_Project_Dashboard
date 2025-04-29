// src/Component/Utils/AdvancedTable.jsx
import React, {useState, useMemo, useEffect} from "react";
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
import {FaEye, FaEdit, FaTrashAlt} from "react-icons/fa";

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
                                          onView = null,            // <-- support view callback
                                      }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [columnFilters, setColumnFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState(null);
    const [sortDir, setSortDir] = useState("asc");
    const itemsPerPage = 20;

    // 1. Reset all state
    const handleReset = () => {
        setSearchTerm("");
        setColumnFilters({});
        setSortBy(null);
        setSortDir("asc");
        setCurrentPage(1);
    };

    // 2. Global + column filters
    const filtered = useMemo(() => {
        let fd = data;
        if (searchTerm) {
            const t = searchTerm.toLowerCase();
            fd = fd.filter((row) =>
                columns.some((col) => {
                    const v = row[col.accessor];
                    return v != null && v.toString().toLowerCase().includes(t);
                })
            );
        }
        Object.entries(columnFilters).forEach(([acc, f]) => {
            if (!f) return;
            const def = columns.find((c) => c.accessor === acc);
            fd = fd.filter((row) => {
                const v = row[acc];
                if (def.filterType === "multi-select") {
                    if (!Array.isArray(f) || f.length === 0) return true;
                    return f.includes(v);
                }
                return v != null && v.toString().toLowerCase().includes(f.toLowerCase());
            });
        });
        return fd;
    }, [data, searchTerm, columnFilters, columns]);

    // 3. Sorting
    const sorted = useMemo(() => {
        if (!sortBy) return filtered;
        const dir = sortDir === "asc" ? 1 : -1;
        return [...filtered].sort((a, b) => {
            const va = a[sortBy], vb = b[sortBy];
            if (va == null && vb == null) return 0;
            if (va == null) return -dir;
            if (vb == null) return dir;
            if (!isNaN(va) && !isNaN(vb)) {
                return (parseFloat(va) - parseFloat(vb)) * dir;
            }
            return va.toString().localeCompare(vb.toString()) * dir;
        });
    }, [filtered, sortBy, sortDir]);

    // 4. Pagination math
    const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
    useEffect(() => setCurrentPage(1), [searchTerm, sortBy, sortDir, columnFilters]);
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages]);
    const paginated = sorted.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const canEdit = onEdit && editRoles.includes(userRole);
    const canDelete = onDelete && deleteRoles.includes(userRole);
    const canView = typeof onView === "function";

    // handlers
    const handleSort = (acc) => {
        if (sortBy === acc) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortBy(acc);
            setSortDir("asc");
        }
    };
    const downloadCSV = () => {
        const hdrs = columns.map((c) => c.header);
        const rowsCsv = sorted.map((row) =>
            columns
                .map((c) => {
                    const v = row[c.accessor] ?? "";
                    return `"${String(v).replace(/"/g, '""')}"`;
                })
                .join(",")
        );
        const csv = [hdrs.join(","), ...rowsCsv].join("\n");
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
            {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}

            {/* Search / Reset / CSV */}
            <div className="flex justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Search all..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-md"
                    />
                    <button
                        onClick={handleReset}
                        className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Reset
                    </button>
                </div>
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

                    {/* Header Row */}
                    <TableHeader>
                        <TableRow className="bg-gray-200">
                            {columns.map((col) => (
                                <TableHead
                                    key={col.accessor}
                                    className="px-4 py-2 cursor-pointer"
                                    onClick={() => handleSort(col.accessor)}
                                >
                                    {col.header}
                                    {sortBy === col.accessor && (sortDir === "asc" ? " ▲" : " ▼")}
                                </TableHead>
                            ))}
                            {canView && <TableHead>View</TableHead>}
                            {canEdit && <TableHead>Edit</TableHead>}
                            {canDelete && <TableHead>Delete</TableHead>}
                        </TableRow>

                        {/* Filters Row */}
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={col.accessor} className="text-center">
                                    {col.filterType === "multi-select" ? (
                                        <MultiSelectFilter
                                            options={col.options || []}
                                            selectedValues={columnFilters[col.accessor] || []}
                                            onChange={(sel) =>
                                                setColumnFilters((p) => ({...p, [col.accessor]: sel}))
                                            }
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder={`Filter ${col.header}`}
                                            value={columnFilters[col.accessor] || ""}
                                            onChange={(e) =>
                                                setColumnFilters((p) => ({
                                                    ...p,
                                                    [col.accessor]: e.target.value,
                                                }))
                                            }
                                            className="w-full p-1 text-xs border rounded"
                                        />
                                    )}
                                </TableHead>
                            ))}
                            {canView && <TableHead/>}
                            {canEdit && <TableHead/>}
                            {canDelete && <TableHead/>}
                        </TableRow>
                    </TableHeader>

                    {/* Body Rows */}
                    <TableBody>
                        {paginated.map((row, idx) => {
                            const key = row.id ?? `${idx}-${JSON.stringify(row).slice(0, 20)}`;
                            return (
                                <TableRow
                                    key={key}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => canView && onView(row)}  // row‐click opens view
                                >
                                    {columns.map((col) => (
                                        <TableCell key={col.accessor}>
                                            {col.render ? col.render(row, idx) : row[col.accessor] ?? "N/A"}
                                        </TableCell>
                                    ))}

                                    {/* View Button */}
                                    {canView && (
                                        <TableCell className="text-center">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onView(row);
                                                }}
                                            >
                                                <FaEye/>
                                            </Button>
                                        </TableCell>
                                    )}

                                    {/* Edit Button */}
                                    {canEdit && (
                                        <TableCell className="text-center">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(row);
                                                }}
                                            >
                                                <FaEdit/>
                                            </Button>
                                        </TableCell>
                                    )}

                                    {/* Delete Button */}
                                    {canDelete && (
                                        <TableCell className="text-center">
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(row);
                                                }}
                                            >
                                                <FaTrashAlt/>
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>

                    {/* Optional Footer */}
                    {footer?.totalLabels && (
                        <TableFooter>
                            <TableRow>
                                {footer.totalLabels.map((label, i) => (
                                    <TableCell key={i}>{label.content}</TableCell>
                                ))}
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4 px-4">
                <Button variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}>
                    Previous
                </Button>
                <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
                <Button variant="outline" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}>
                    Next
                </Button>
            </div>
        </div>
    );
}