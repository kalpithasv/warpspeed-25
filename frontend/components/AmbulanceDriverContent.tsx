"use client";

import * as React from "react";
import {
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SelectButton = ({ value }: { value: string }) => {
  return (
    <Select defaultValue={value}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ongoing">Ongoing</SelectItem>
        <SelectItem value="arriving">Arriving</SelectItem>
        <SelectItem value="picked">Picked</SelectItem>
        <SelectItem value="reached">Reached</SelectItem>
      </SelectContent>
    </Select>
  );
};
const data: Payment[] = [
  {
    requestNumber: "#WD7431",
    status: <SelectButton value="ongoing" />,
    whatsappNumber: "+917550148119",
    location: "https://goo.gl/maps/5Lf4JhFqypghfLoB7",
  },
  {
    requestNumber: "#WD7432",
    status: <SelectButton value="arriving" />,
    whatsappNumber: "+917550148119",
    location: "https://goo.gl/maps/5Lf4JhFqypghfLoB7",
  },
  {
    requestNumber: "#WD7433",
    status: <SelectButton value="ongoing" />,
    whatsappNumber: "+917550148119",
    location: "https://goo.gl/maps/5Lf4JhFqypghfLoB7",
  },
  {
    requestNumber: "#WD7434",
    status: <SelectButton value="ongoing" />,
    whatsappNumber: "+917550148119",
    location: "https://goo.gl/maps/5Lf4JhFqypghfLoB7",
  },
  {
    requestNumber: "#WD7435",
    status: <SelectButton value="ongoing" />,
    whatsappNumber: "+917550148119",
    location: "https://goo.gl/maps/5Lf4JhFqypghfLoB7",
  },
];

export type Payment = {
  status: React.ReactNode;
  requestNumber: string;
  whatsappNumber: string;
  location: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "requestNumber",
    header: "Request Number",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("requestNumber")}</div>
    ),
  },
  {
    accessorKey: "whatsappNumber",
    header: () => <div className="">Whatsapp Number</div>,
    cell: ({ row }) => {
      return (
        <div className="font-medium">{row.getValue("whatsappNumber")}</div>
      );
    },
  },
  {
    accessorKey: "location",
    header: () => <div className="">Location</div>,
    cell: ({ row }) => {
      return (
        <div
          onClick={() => (location.href = row.getValue("location"))}
          className="font-medium text-blue-500 cursor-pointer hover:underline"
        >
          {row.getValue("location")}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem className="bg-red-500 text-white focus:bg-red-800 focus:text-white/90 cursor-pointer">
              Delete Appointment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function DataTableDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table className="bg-white">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
