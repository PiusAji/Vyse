"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, ArrowUpDown, Trash2, PlusCircle } from "lucide-react";
import { Order, OrderStatus } from "@prisma/client";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface OrderWithRelations extends Order {
  user?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
}

const OrdersManagement: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [searchCustomerName, setSearchCustomerName] = useState("");
  const [searchStatus, setSearchStatus] = useState<OrderStatus | "ALL">("ALL");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus | null>(
    null
  );

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      if (searchOrderId) params.append("orderId", searchOrderId);
      if (searchCustomerName) params.append("customerName", searchCustomerName);
      if (searchStatus && searchStatus !== "ALL")
        params.append("status", searchStatus);
      if (searchStartDate && searchEndDate)
        params.append("dateRange", `${searchStartDate},${searchEndDate}`);

      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setOrders(data.orders);
      setTotalOrders(data.totalOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    sortBy,
    sortOrder,
    searchOrderId,
    searchCustomerName,
    searchStatus,
    searchStartDate,
    searchEndDate,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      const response = await fetch(`/api/admin/orders/${orderToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete order");
      }

      toast({
        title: "Success",
        description: "Order successfully deleted!",
      });
      fetchOrders(); // Refresh the list
      setOrderToDelete(null);
    } catch (err: unknown) {
      console.error("Failed to delete order:", err);
      toast({
        title: "Error",
        description: (err as Error).message || "Failed to delete order.",
        variant: "destructive",
      });
      setError("Failed to delete order.");
    }
  };

  const totalPages = Math.ceil(totalOrders / limit);

  const handleUpdateOrderStatus = async () => {
    if (!editingOrderId || !newOrderStatus) return;

    try {
      const response = await fetch(`/api/admin/orders/${editingOrderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newOrderStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order status");
      }

      toast({
        title: "Success",
        description: "Order status updated successfully!",
      });
      fetchOrders(); // Refresh the list to reflect the change
    } catch (err: unknown) {
      console.error("Failed to update order status:", err);
      toast({
        title: "Error",
        description: (err as Error).message || "Failed to update order status.",
        variant: "destructive",
      });
    } finally {
      setEditingOrderId(null);
      setNewOrderStatus(null);
    }
  };

  return (
    <React.Fragment>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Order Management</h1>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => router.push("/admin/orders/new")}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Order
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search by Order ID"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            onBlur={fetchOrders}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchOrders();
            }}
          />
          <Input
            placeholder="Search by Customer Name"
            value={searchCustomerName}
            onChange={(e) => setSearchCustomerName(e.target.value)}
            onBlur={fetchOrders}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchOrders();
            }}
          />
          <Select
            value={searchStatus}
            onValueChange={(value: string) => {
              setSearchStatus(
                (value === "" ? "ALL" : value) as OrderStatus | "ALL"
              );
              fetchOrders();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {Object.values(OrderStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input
              type="date"
              value={searchStartDate}
              onChange={(e) => setSearchStartDate(e.target.value)}
              onBlur={fetchOrders}
            />
            <Input
              type="date"
              value={searchEndDate}
              onChange={(e) => setSearchEndDate(e.target.value)}
              onBlur={fetchOrders}
            />
          </div>
        </div>

        {loading && <p>Loading orders...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="bg-card text-card-foreground shadow-md rounded-lg overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary text-secondary-foreground">
                <TableRow>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("id")}
                  >
                    Order ID{" "}
                    {sortBy === "id" && (
                      <ArrowUpDown
                        className={`inline-block h-4 w-4 ${
                          sortOrder === "asc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("user.firstName")}
                  >
                    Customer Name{" "}
                    {sortBy === "user.firstName" && (
                      <ArrowUpDown
                        className={`inline-block h-4 w-4 ${
                          sortOrder === "asc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    Order Date{" "}
                    {sortBy === "createdAt" && (
                      <ArrowUpDown
                        className={`inline-block h-4 w-4 ${
                          sortOrder === "asc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    Status{" "}
                    {sortBy === "status" && (
                      <ArrowUpDown
                        className={`inline-block h-4 w-4 ${
                          sortOrder === "asc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("total")}
                  >
                    Total Amount{" "}
                    {sortBy === "total" && (
                      <ArrowUpDown
                        className={`inline-block h-4 w-4 ${
                          sortOrder === "asc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </TableHead>
                  <TableHead className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-card divide-y divide-border">
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="hover:bg-accent hover:text-accent-foreground"
                    >
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {order.id}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.user
                          ? `${order.user.firstName || ""} ${
                              order.user.lastName || ""
                            }`.trim() || order.user.email
                          : order.guestEmail || "N/A"}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                        {format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                        <Select
                          value={order.status}
                          onValueChange={(value: string) => {
                            setEditingOrderId(order.id);
                            setNewOrderStatus(value as OrderStatus);
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(OrderStatus).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0) +
                                  status.slice(1).toLowerCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                        ${order.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-primary hover:text-primary/80 mr-4"
                        >
                          View
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setOrderToDelete(order.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the order {orderToDelete} and
                                remove its data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteOrder}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex justify-between items-center p-4">
              <Button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || loading}
                variant="outline"
              >
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages || loading}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!editingOrderId}
        onOpenChange={(open) => {
          if (!open) {
            setEditingOrderId(null);
            setNewOrderStatus(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of order{" "}
              <strong>{editingOrderId}</strong> to{" "}
              <strong>{newOrderStatus?.toLowerCase()}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateOrderStatus}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
};

export default OrdersManagement;
