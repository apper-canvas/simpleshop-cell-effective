import React from "react";
import { cn } from "@/utils/cn";

const Table = ({ children, className, ...props }) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className={cn("min-w-full divide-y divide-gray-200", className)} {...props}>
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children, className, ...props }) => {
  return (
    <thead className={cn("bg-gray-50", className)} {...props}>
      {children}
    </thead>
  );
};

const TableBody = ({ children, className, ...props }) => {
  return (
    <tbody className={cn("divide-y divide-gray-200 bg-white", className)} {...props}>
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className, hover = true, ...props }) => {
  return (
    <tr 
      className={cn(
        hover && "hover:bg-gray-50 transition-colors duration-150",
        className
      )} 
      {...props}
    >
      {children}
    </tr>
  );
};

const TableHead = ({ children, className, ...props }) => {
  return (
    <th 
      className={cn(
        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
        className
      )} 
      {...props}
    >
      {children}
    </th>
  );
};

const TableCell = ({ children, className, ...props }) => {
  return (
    <td 
      className={cn("px-6 py-4 whitespace-nowrap text-sm text-gray-900", className)} 
      {...props}
    >
      {children}
    </td>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;

export default Table;