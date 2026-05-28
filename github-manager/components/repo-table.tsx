"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Checkbox } from "@/components/ui/checkbox";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

type Repo = {
  id: number;
  name: string;
  html_url: string;
  private: boolean;
  archived: boolean;
};

export default function RepoTable() {

  const [repos, setRepos] = useState<Repo[]>(
    []
  );

  const [selected, setSelected] = useState<
    string[]
  >([]);

  const [globalFilter, setGlobalFilter] =
    useState("");

  const [pageSize, setPageSize] =
    useState(10);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    loadRepos();
  }, []);

  async function loadRepos() {

    setLoading(true);

    try {

      const res = await fetch("/api/repos");

      const data = await res.json();

      setRepos(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  }

  function toggleRepo(name: string) {

    setSelected((prev) =>
      prev.includes(name)
        ? prev.filter((r) => r !== name)
        : [...prev, name]
    );
  }

  const filteredRepos = useMemo(() => {

    return repos.filter((repo) =>
      repo.name
        .toLowerCase()
        .includes(
          globalFilter.toLowerCase()
        )
    );

  }, [repos, globalFilter]);

  function toggleAll() {

    if (
      selected.length ===
      filteredRepos.length
    ) {

      setSelected([]);

    } else {

      setSelected(
        filteredRepos.map((r) => r.name)
      );
    }
  }

  async function archiveSelected() {

    if (
      !confirm(
        `Archive ${selected.length} repositories?`
      )
    )
      return;

    try {

      setLoading(true);

      await Promise.all(

        selected.map(async (repo) => {

          await fetch("/api/archive", {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              repo,
              archived: true,
            }),
          });
        })
      );

      await loadRepos();

      setSelected([]);

      alert("Repositories archived");

    } catch (error) {

      console.error(error);

      alert("Archive failed");

    } finally {

      setLoading(false);
    }
  }

  const columns: ColumnDef<Repo>[] = [

    {
      id: "select",

      header: () => (

        <Checkbox
          checked={
            filteredRepos.length > 0 &&
            selected.length ===
              filteredRepos.length
          }
          onCheckedChange={toggleAll}
        />
      ),

      cell: ({ row }) => (

        <Checkbox
          checked={selected.includes(
            row.original.name
          )}
          onCheckedChange={() =>
            toggleRepo(row.original.name)
          }
        />
      ),
    },

    {
      accessorKey: "name",

      header: "Repository",

      cell: ({ row }) => (

        <a
          href={row.original.html_url}
          target="_blank"
          className="font-medium hover:underline text-blue-500"
        >
          {row.original.name}
        </a>
      ),
    },

    {
      accessorKey: "private",

      header: "Visibility",

      cell: ({ row }) => (

        <span
          className={`px-2 py-1 rounded text-xs ${
            row.original.private
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-green-500/20 text-green-400"
          }`}
        >
          {row.original.private
            ? "Private"
            : "Public"}
        </span>
      ),
    },

    {
      accessorKey: "archived",

      header: "Status",

      cell: ({ row }) => (

        <span
          className={`px-2 py-1 rounded text-xs ${
            row.original.archived
              ? "bg-gray-500/20 text-gray-400"
              : "bg-green-500/20 text-green-400"
          }`}
        >
          {row.original.archived
            ? "Archived"
            : "Active"}
        </span>
      ),
    },

    {
      id: "actions",

      header: "Actions",

      cell: ({ row }) => (

        <Button
          size="sm"
          variant={
            row.original.archived
              ? "secondary"
              : "outline"
          }
          onClick={async () => {

            const archiveAction =
              row.original.archived
                ? "Unarchive"
                : "Archive";

            if (
              !confirm(
                `${archiveAction} ${row.original.name}?`
              )
            )
              return;

            await fetch(
              "/api/archive",
              {
                method: "PATCH",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  repo:
                    row.original.name,

                  archived:
                    !row.original
                      .archived,
                }),
              }
            );

            await loadRepos();
          }}
        >
          <Archive className="w-4 h-4 mr-2" />

          {row.original.archived
            ? "Unarchive"
            : "Archive"}
        </Button>
      ),
    },
  ];

  const table = useReactTable({

    data: filteredRepos,

    columns,

    getCoreRowModel:
      getCoreRowModel(),

    getPaginationRowModel:
      getPaginationRowModel(),

    state: {
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
  });

  return (

    <div className="p-8">

      <div className="rounded-2xl border bg-background shadow">

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 border-b">

          <div>

            <h1 className="text-2xl font-bold">
              GitHub Repository Manager
            </h1>

            <p className="text-muted-foreground text-sm">
              Manage repositories with archive controls
            </p>

          </div>

          <div className="flex flex-col md:flex-row gap-3">

            <div className="relative">

              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />

              <Input
                placeholder="Search repositories..."
                value={globalFilter}
                onChange={(e) =>
                  setGlobalFilter(
                    e.target.value
                  )
                }
                className="pl-9 w-[250px]"
              />

            </div>

            <Button
              variant="secondary"
              disabled={
                selected.length === 0 ||
                loading
              }
              onClick={archiveSelected}
            >
              <Archive className="w-4 h-4 mr-2" />

              Archive ({selected.length})
            </Button>

          </div>

        </div>

        <div className="overflow-auto">

          <Table>

            <TableHeader className="sticky top-0 bg-background z-10">

              {table
                .getHeaderGroups()
                .map((headerGroup) => (

                  <TableRow
                    key={headerGroup.id}
                  >

                    {headerGroup.headers.map(
                      (header) => (

                        <TableHead
                          key={header.id}
                        >

                          {flexRender(
                            header.column
                              .columnDef
                              .header,

                            header.getContext()
                          )}

                        </TableHead>
                      )
                    )}

                  </TableRow>
                ))}

            </TableHeader>

            <TableBody>

              {table
                .getRowModel()
                .rows.map((row) => (

                  <TableRow key={row.id}>

                    {row
                      .getVisibleCells()
                      .map((cell) => (

                        <TableCell
                          key={cell.id}
                        >

                          {flexRender(
                            cell.column
                              .columnDef
                              .cell,

                            cell.getContext()
                          )}

                        </TableCell>
                      ))}

                  </TableRow>
                ))}

            </TableBody>

          </Table>

        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-6 border-t">

          <div className="flex items-center gap-4">

            <div className="text-sm text-muted-foreground">

              Total Repositories:

              <span className="font-semibold ml-1 text-foreground">

                {filteredRepos.length}

              </span>

            </div>

            <div className="flex items-center gap-2">

              <span className="text-sm text-muted-foreground">
                Rows per page
              </span>

              <select
                value={pageSize}
                onChange={(e) =>
                  setPageSize(
                    Number(e.target.value)
                  )
                }
                className="border rounded-md px-2 py-1 bg-background"
              >
                <option value={10}>
                  10
                </option>

                <option value={30}>
                  30
                </option>

                <option value={50}>
                  50
                </option>

                <option value={100}>
                  100
                </option>

                <option
                  value={
                    filteredRepos.length
                  }
                >
                  All
                </option>

              </select>

            </div>

          </div>

          <div className="flex items-center gap-4">

            <span className="text-sm text-muted-foreground">

              Page{" "}

              {table.getState().pagination
                .pageIndex + 1}

              {" "}of{" "}

              {table.getPageCount()}

            </span>

            <div className="flex gap-2">

              <Button
                size="icon"
                variant="outline"
                onClick={() =>
                  table.previousPage()
                }
                disabled={
                  !table.getCanPreviousPage()
                }
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                size="icon"
                variant="outline"
                onClick={() =>
                  table.nextPage()
                }
                disabled={
                  !table.getCanNextPage()
                }
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}