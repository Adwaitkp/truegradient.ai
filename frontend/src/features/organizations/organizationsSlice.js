import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    const error = new Error(data.message || 'Request failed');
    error.response = { status: res.status, data };
    throw error;
  }
  
  return data;
}

// Async thunks
export const fetchOrganizations = createAsyncThunk(
  'organizations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await request('/api/organizations');
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.response?.status
      });
    }
  }
);

export const fetchOrganization = createAsyncThunk(
  'organizations/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await request(`/api/organizations/${id}`);
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.response?.status
      });
    }
  }
);

export const createOrganization = createAsyncThunk(
  'organizations/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await request('/api/organizations', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.response?.status
      });
    }
  }
);

export const renameOrganization = createAsyncThunk(
  'organizations/rename',
  async ({ id, name }, { rejectWithValue }) => {
    try {
      return await request(`/api/organizations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name })
      });
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.response?.status
      });
    }
  }
);

export const deleteOrganization = createAsyncThunk(
  'organizations/delete',
  async (id, { rejectWithValue }) => {
    try {
      await request(`/api/organizations/${id}`, {
        method: 'DELETE'
      });
      return { id };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.response?.status
      });
    }
  }
);

export const addMember = createAsyncThunk(
  'organizations/addMember',
  async ({ organizationId, userId }, { rejectWithValue }) => {
    try {
      return await request(`/api/organizations/${organizationId}/members`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.response?.status
      });
    }
  }
);

export const removeMember = createAsyncThunk(
  'organizations/removeMember',
  async ({ organizationId, userId }, { rejectWithValue }) => {
    try {
      return await request(`/api/organizations/${organizationId}/members/${userId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.response?.status
      });
    }
  }
);

const slice = createSlice({
  name: 'organizations',
  initialState: {
    organizations: [],
    currentOrganization: null,
    defaultOrganization: null,
    loading: false,
    error: null
  },
  reducers: {
    setCurrentOrganization(state, action) {
      state.currentOrganization = action.payload;
    },
    setDefaultOrganization(state, action) {
      state.defaultOrganization = action.payload;
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all organizations
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload.organizations || [];
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single organization
      .addCase(fetchOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrganization = action.payload.organization;
      })
      .addCase(fetchOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create organization
      .addCase(createOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations.push(action.payload.organization);
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Rename organization
      .addCase(renameOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(renameOrganization.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.organizations.findIndex(
          org => org._id === action.payload.organization._id
        );
        if (index !== -1) {
          state.organizations[index] = action.payload.organization;
        }
        if (state.currentOrganization?._id === action.payload.organization._id) {
          state.currentOrganization = action.payload.organization;
        }
      })
      .addCase(renameOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete organization
      .addCase(deleteOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = state.organizations.filter(
          org => org._id !== action.payload.id
        );
        if (state.currentOrganization?._id === action.payload.id) {
          state.currentOrganization = null;
        }
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add member
      .addCase(addMember.fulfilled, (state, action) => {
        const index = state.organizations.findIndex(
          org => org._id === action.payload.organization._id
        );
        if (index !== -1) {
          state.organizations[index] = action.payload.organization;
        }
      })
      
      // Remove member
      .addCase(removeMember.fulfilled, (state, action) => {
        const index = state.organizations.findIndex(
          org => org._id === action.payload.organization._id
        );
        if (index !== -1) {
          state.organizations[index] = action.payload.organization;
        }
      });
  }
});

export const { setCurrentOrganization, setDefaultOrganization, clearError } = slice.actions;
export default slice.reducer;
