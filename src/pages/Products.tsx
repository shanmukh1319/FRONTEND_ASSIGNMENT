import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { productApi } from "../api/products";
import { DynamicForm } from "../components/DynamicForm";
import productFormConfig from "../config/productForm.json";
import type { FormConfig, FormField } from "../types/form";
import type {
  Product,
  ProductPayload,
  ProductQueryParams,
} from "../types/product";

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "name" | "price" | "createdAt" | "updatedAt" | "inventoryCount"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const formConfig = productFormConfig as FormConfig;

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchTerm, statusFilter, sortBy, sortOrder]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: ProductQueryParams = {
        page: page + 1, // API uses 1-based pagination
        limit: rowsPerPage,
        sortBy,
        sortOrder,
        search: searchTerm || undefined,
        status:
          statusFilter !== "all" ? (statusFilter as "1" | "0") : undefined,
      };
      const response = await productApi.getAll(params);
      setProducts(response.data);
      setPaginationMeta({
        total: response.meta.total,
        totalPages: response.meta.totalPages,
        hasNextPage: response.meta.hasNextPage,
        hasPreviousPage: response.meta.hasPreviousPage,
      });
    } catch (error) {
      console.error("Failed to load products:", error);
      setSnackbar({
        open: true,
        message: "Failed to load products",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    setEditingProduct(product || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset editing product after a short delay to allow form to unmount
    setTimeout(() => {
      setEditingProduct(null);
    }, 100);
  };

  const handleSubmit = async (formData: Record<string, string | undefined>) => {
    try {
      // Map form status value to database format
      // Form "1" (ACTIVE) -> DB "1"
      // Form "2" (INACTIVE) -> DB "0"
      let dbStatus = "1"; // Default to Active
      if (formData.Status) {
        const formStatusValue = formData.Status;
        if (formStatusValue === "1") {
          // ACTIVE
          dbStatus = "1";
        } else if (formStatusValue === "2") {
          // INACTIVE
          dbStatus = "0";
        }
      }

      // Map form data to payload based on form config
      const payload: ProductPayload = {
        name: formData.Name || "",
        description: formData.Description || "",
        price: formData.Price || "",
        currency: formData.Currency || "",
        inventoryCount: formData["Inventory Count"] || "",
        status: dbStatus,
      };

      if (editingProduct) {
        await productApi.update(editingProduct.id, payload);
        setSnackbar({
          open: true,
          message: "Product updated successfully",
          severity: "success",
        });
      } else {
        await productApi.create(payload);
        setSnackbar({
          open: true,
          message: "Product created successfully",
          severity: "success",
        });
      }
      // Only close dialog and reload on success
      handleCloseDialog();
      loadProducts();
    } catch (error) {
      console.error("Failed to save product:", error);
      // Keep modal open on error so user can fix and retry
      setSnackbar({
        open: true,
        message: `Failed to ${editingProduct ? "update" : "create"} product`,
        severity: "error",
      });
      // Don't close dialog on error - let user fix the issue
    }
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await productApi.delete(productToDelete);
      setSnackbar({
        open: true,
        message: "Product deleted successfully",
        severity: "success",
      });
      loadProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete product",
        severity: "error",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setProductToDelete(null);
  };

  // Products are already filtered and paginated by the API
  const paginatedProducts = products;

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
    field: "name" | "price" | "createdAt" | "updatedAt" | "inventoryCount"
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

  // Prepare initial form values for editing
  const getInitialFormValues = (): Record<string, string> => {
    if (!editingProduct) return {};

    const initialValues: Record<string, string> = {};

    formConfig.data.forEach((field) => {
      const fieldKey = `field_${field.id}`;
      switch (field.name) {
        case "Name":
          initialValues[fieldKey] = editingProduct.name || "";
          break;
        case "Description":
          initialValues[fieldKey] = editingProduct.description || "";
          break;
        case "Price":
          initialValues[fieldKey] = String(editingProduct.price || "");
          break;
        case "Currency":
          initialValues[fieldKey] = editingProduct.currency || "";
          break;
        case "Inventory Count":
          initialValues[fieldKey] = String(editingProduct.inventoryCount || "");
          break;
        case "Status":
          // Map database status to form value
          // DB "1" or 1 = ACTIVE -> form "1" (index 0 + 1)
          // DB "0" or 0 = INACTIVE -> form "2" (index 1 + 1)
          if (field.listOfValues1) {
            const statusValue = editingProduct.status;
            // Handle both string and number types, preserving 0
            const dbStatus =
              statusValue != null ? String(statusValue).trim() : "";
            let formValue = "";

            // Convert to string and compare
            if (dbStatus === "1") {
              // ACTIVE is at index 0, form value is "1"
              formValue = "1";
            } else if (dbStatus === "0") {
              // INACTIVE is at index 1, form value is "2"
              formValue = "2";
            } else {
              // Try to match by name (for backward compatibility)
              const statusIndex = field.listOfValues1.findIndex(
                (s) => s.toUpperCase() === dbStatus.toUpperCase()
              );
              formValue = statusIndex >= 0 ? String(statusIndex + 1) : "1"; // Default to Active
            }

            initialValues[fieldKey] = formValue;
          }
          break;
        default:
          initialValues[fieldKey] = "";
      }
    });

    return initialValues;
  };

  // Get table columns from form config (excluding fields that shouldn't be displayed)
  const getTableColumns = (): FormField[] => {
    // Return all fields from form config for table display
    return formConfig.data;
  };

  // Get display value for a product field
  const getFieldDisplayValue = (product: Product, field: FormField): string => {
    switch (field.name) {
      case "Name":
        return product.name || "";
      case "Description":
        return product.description || "";
      case "Price": {
        const price = product.price || "";
        const currency = product.currency || "";
        return currency ? `${currency} ${price}` : String(price);
      }
      case "Currency":
        return product.currency || "";
      case "Inventory Count":
        return String(product.inventoryCount || "0");
      case "Status": {
        // Map database status to display name
        // DB "1" or 1 = Active, DB "0" or 0 = Inactive
        // Handle both string and number types from backend
        const statusValue = product.status;
        // Convert to string, handling null/undefined but preserving 0
        const dbStatus = statusValue != null ? String(statusValue).trim() : "";
        // Compare as string
        if (dbStatus === "1") {
          return "Active";
        } else if (dbStatus === "0") {
          return "Inactive";
        } else if (field.listOfValues1) {
          // Try to find by name (for backward compatibility)
          const found = field.listOfValues1.find(
            (s) => s.toUpperCase() === dbStatus.toUpperCase()
          );
          return found || dbStatus;
        }
        return dbStatus;
      }
      default:
        return "";
    }
  };

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
          Product Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Product
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
            placeholder="Search by name, SKU, or description"
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => handleStatusFilterChange(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="1">Active</MenuItem>
              <MenuItem value="0">Inactive</MenuItem>
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
                    | "name"
                    | "price"
                    | "createdAt"
                    | "updatedAt"
                    | "inventoryCount"
                )
              }
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="createdAt">Created Date</MenuItem>
              <MenuItem value="updatedAt">Updated Date</MenuItem>
              <MenuItem value="inventoryCount">Inventory</MenuItem>
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
        ) : paginatedProducts.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              No products found
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  {getTableColumns().map((field) => (
                    <TableCell
                      key={field.id}
                      align={
                        field.inputType === "number" ||
                        field.name === "Price" ||
                        field.name === "Inventory Count"
                          ? "right"
                          : "left"
                      }
                    >
                      {field.name}
                    </TableCell>
                  ))}
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts.map((product) => (
                  <TableRow key={product.id} hover>
                    {getTableColumns().map((field) => (
                      <TableCell
                        key={field.id}
                        align={
                          field.inputType === "number" ||
                          field.name === "Price" ||
                          field.name === "Inventory Count"
                            ? "right"
                            : "left"
                        }
                      >
                        {field.name === "Status"
                          ? (() => {
                              const statusValue = getFieldDisplayValue(
                                product,
                                field
                              );
                              const statusUpper = String(
                                statusValue || ""
                              ).toUpperCase();
                              return (
                                <Chip
                                  label={statusValue}
                                  color={
                                    statusUpper === "ACTIVE"
                                      ? "success"
                                      : statusUpper === "INACTIVE"
                                      ? "error"
                                      : "default"
                                  }
                                  size="small"
                                />
                              );
                            })()
                          : getFieldDisplayValue(product, field)}
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(product)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(product.id)}
                      >
                        <DeleteIcon />
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

      {/* Product Form Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogContent>
          <DynamicForm
            config={formConfig}
            onSubmit={handleSubmit}
            autoSave={false}
            showResetButton={false}
            submitButtonText={editingProduct ? "Update" : "Create"}
            initialValues={getInitialFormValues()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this product? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
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
