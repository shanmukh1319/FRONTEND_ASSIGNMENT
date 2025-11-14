import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
  Typography,
  Drawer,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { orderApi } from "../api/orders";
import { productApi } from "../api/products";
import type {
  Order,
  OrderStatus,
  CreateOrderPayload,
  OrderQueryParams,
} from "../types/order";
import type { Product } from "../types/product";

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "orderNumber" | "totalAmount" | "createdAt" | "updatedAt" | "status"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [orderFormData, setOrderFormData] = useState<{
    customerId: string;
    productId: string;
    quantity: string;
  }>({
    customerId: "",
    productId: "",
    quantity: "1",
  });
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params: OrderQueryParams = {
        page: page + 1, // API uses 1-based pagination
        limit: rowsPerPage,
        sortBy,
        sortOrder,
        search: searchTerm || undefined,
        status:
          statusFilter !== "all" ? (statusFilter as OrderStatus) : undefined,
      };
      const response = await orderApi.getAll(params);
      setOrders(response.data);
      setPaginationMeta({
        total: response.meta.total,
        totalPages: response.meta.totalPages,
        hasNextPage: response.meta.hasNextPage,
        hasPreviousPage: response.meta.hasPreviousPage,
      });
    } catch (error) {
      console.error("Failed to load orders:", error);
      setSnackbar({
        open: true,
        message: "Failed to load orders",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, statusFilter, sortBy, sortOrder]);

  // Calculate total when product or quantity changes
  useEffect(() => {
    if (orderFormData.productId && orderFormData.quantity) {
      const selectedProduct =
        activeProducts.find((p) => p.id === orderFormData.productId) ||
        allProducts.find((p) => p.id === orderFormData.productId);
      if (selectedProduct) {
        const price =
          typeof selectedProduct.price === "string"
            ? parseFloat(selectedProduct.price)
            : selectedProduct.price;
        const quantity = parseInt(orderFormData.quantity) || 1;
        setCalculatedTotal(price * quantity);
      } else {
        setCalculatedTotal(0);
      }
    } else {
      setCalculatedTotal(0);
    }
  }, [
    orderFormData.productId,
    orderFormData.quantity,
    activeProducts,
    allProducts,
  ]);

  useEffect(() => {
    loadActiveProducts();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const loadActiveProducts = async () => {
    try {
      // Get all products with active status filter
      const activeResponse = await productApi.getAll({ status: "1" });
      setActiveProducts(activeResponse.data);

      // Get all products (no filter) for lookup
      const allResponse = await productApi.getAll({ limit: 1000 });
      setAllProducts(allResponse.data);
    } catch (error) {
      console.error("Failed to load active products:", error);
    }
  };

  const handleOpenDrawer = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    // Reset form for new order
    setOrderFormData({
      customerId: "",
      productId: "",
      quantity: "1",
    });
    setCalculatedTotal(0);
    // Reload active products in case new products were added
    loadActiveProducts();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form after a short delay to allow form to unmount
    setTimeout(() => {
      setOrderFormData({
        customerId: "",
        productId: "",
        quantity: "1",
      });
      setCalculatedTotal(0);
    }, 100);
  };

  const handleSubmitOrder = async () => {
    try {
      if (!orderFormData.productId) {
        setSnackbar({
          open: true,
          message: "Please select a product",
          severity: "error",
        });
        return;
      }

      const quantity = parseInt(orderFormData.quantity) || 1;
      if (quantity < 1) {
        setSnackbar({
          open: true,
          message: "Quantity must be at least 1",
          severity: "error",
        });
        return;
      }

      // Create payload according to API documentation
      const payload: CreateOrderPayload = {
        customerId: orderFormData.customerId || undefined,
        items: [
          {
            productId: orderFormData.productId,
            quantity: quantity,
          },
        ],
      };

      await orderApi.create(payload);
      setSnackbar({
        open: true,
        message: "Order created successfully",
        severity: "success",
      });
      // Only close dialog and reload on success
      handleCloseDialog();
      loadOrders();
    } catch (error) {
      console.error("Failed to create order:", error);
      // Keep modal open on error so user can fix and retry
      setSnackbar({
        open: true,
        message: "Failed to create order",
        severity: "error",
      });
      // Don't close dialog on error - let user fix the issue
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;

    try {
      await orderApi.updateStatus(selectedOrder.id, newStatus);
      setSnackbar({
        open: true,
        message: "Order status updated successfully",
        severity: "success",
      });
      loadOrders();
      // Update selected order in drawer
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    } catch (error) {
      console.error("Failed to update order status:", error);
      setSnackbar({
        open: true,
        message: "Failed to update order status",
        severity: "error",
      });
    }
  };

  // Orders are already filtered and paginated by the API
  const paginatedOrders = orders;

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(0); // Reset to first page on search
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(0); // Reset to first page on filter change
  };

  const handleSortChange = (
    field: "orderNumber" | "totalAmount" | "createdAt" | "updatedAt" | "status"
  ) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("DESC");
    }
    setPage(0);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "CREATED":
        return "warning";
      case "PAID":
        return "info";
      case "SHIPPED":
        return "primary";
      case "DELIVERED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const statusOptions: OrderStatus[] = [
    "CREATED",
    "PAID",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Order Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Order
        </Button>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by order number or customer ID"
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) =>
                handleSortChange(
                  e.target.value as
                    | "orderNumber"
                    | "totalAmount"
                    | "createdAt"
                    | "updatedAt"
                    | "status"
                )
              }
            >
              <MenuItem value="orderNumber">Order Number</MenuItem>
              <MenuItem value="totalAmount">Total Amount</MenuItem>
              <MenuItem value="createdAt">Created Date</MenuItem>
              <MenuItem value="updatedAt">Updated Date</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={sortOrder}
              label="Order"
              onChange={(e) => {
                setSortOrder(e.target.value as "ASC" | "DESC");
                setPage(0);
              }}
            >
              <MenuItem value="ASC">Ascending</MenuItem>
              <MenuItem value="DESC">Descending</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : paginatedOrders.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              No orders found
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order Number</TableCell>
                  <TableCell>Customer ID</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{order.customerId || "N/A"}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        {order.items.map((item, index) => (
                          <Box key={item.id}>
                            <Typography variant="body2" component="span">
                              {item.productSnapshot.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 1 }}
                            >
                              (Qty: {item.quantity} × {item.unitPrice} ={" "}
                              {item.lineTotal})
                            </Typography>
                            {index < order.items.length - 1 && (
                              <Divider sx={{ my: 0.5 }} />
                            )}
                          </Box>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {order.currency} {order.totalAmount}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="default"
                        onClick={() => handleOpenDrawer(order)}
                        title="View Details"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={paginationMeta.total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
            />
          </>
        )}
      </TableContainer>

      {/* Order Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 400 } },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Order Details
          </Typography>
          <Divider sx={{ my: 2 }} />

          {selectedOrder && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Order Number
                </Typography>
                <Typography variant="body1">
                  {selectedOrder.orderNumber}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Order ID
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontSize: "0.875rem", wordBreak: "break-all" }}
                >
                  {selectedOrder.id}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Customer ID
                </Typography>
                <Typography variant="body1">
                  {selectedOrder.customerId || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Items ({selectedOrder.items.length})
                </Typography>
                {selectedOrder.items.map((item) => (
                  <Box
                    key={item.id}
                    sx={{ mb: 1, p: 1, bgcolor: "grey.50", borderRadius: 1 }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {item.productSnapshot.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      SKU: {item.productSnapshot.sku} | Qty: {item.quantity} |
                      Price: {item.unitPrice} | Total: {item.lineTotal}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {selectedOrder.currency} {selectedOrder.totalAmount}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleStatusChange(e.target.value as OrderStatus)
                    }
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {selectedOrder.createdAt && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              )}

              {selectedOrder.updatedAt && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Updated At
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedOrder.updatedAt).toLocaleString()}
                  </Typography>
                </Box>
              )}

              <Button
                variant="outlined"
                fullWidth
                onClick={handleCloseDrawer}
                sx={{ mt: 3 }}
              >
                Close
              </Button>
            </>
          )}
        </Box>
      </Drawer>

      {/* Create/Edit Order Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            <TextField
              label="Customer ID (Optional)"
              variant="outlined"
              fullWidth
              placeholder="CUST-001"
              value={orderFormData.customerId}
              onChange={(e) =>
                setOrderFormData({
                  ...orderFormData,
                  customerId: e.target.value,
                })
              }
              helperText="Optional customer identifier"
            />

            <FormControl fullWidth required>
              <InputLabel>Product</InputLabel>
              <Select
                value={orderFormData.productId}
                label="Product"
                onChange={(e) =>
                  setOrderFormData({
                    ...orderFormData,
                    productId: e.target.value,
                  })
                }
              >
                {activeProducts.length === 0 ? (
                  <MenuItem disabled>No active products available</MenuItem>
                ) : (
                  activeProducts.map((product) => {
                    const price =
                      typeof product.price === "string"
                        ? parseFloat(product.price)
                        : product.price;
                    const currency = product.currency || "";
                    const priceDisplay = currency
                      ? `${currency} ${price}`
                      : `$${price}`;
                    return (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name} - {priceDisplay}
                        {product.inventoryCount &&
                          ` (Stock: ${product.inventoryCount})`}
                      </MenuItem>
                    );
                  })
                )}
              </Select>
            </FormControl>

            <TextField
              label="Quantity"
              variant="outlined"
              type="number"
              fullWidth
              required
              inputProps={{ min: 1 }}
              value={orderFormData.quantity}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || parseInt(value) > 0) {
                  setOrderFormData({
                    ...orderFormData,
                    quantity: value,
                  });
                }
              }}
            />

            {calculatedTotal > 0 && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: "primary.light",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Amount
                </Typography>
                <Typography variant="h6" color="primary.contrastText">
                  ${calculatedTotal.toFixed(2)}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmitOrder}
            variant="contained"
            disabled={
              !orderFormData.productId ||
              !orderFormData.quantity ||
              parseInt(orderFormData.quantity) <= 0
            }
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
