// supabase-config.js

// supabase-config.js

// Define the initialization function and export it
function initSupabase() {
  import { createClient } from '@supabase/supabase-js';

  // Get environment variables
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing Supabase environment variables");
    throw new Error("Missing Supabase environment variables");
  }

  // Initialize the Supabase client
  const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

  // Check Supabase connection
  async function testConnection() {
    try {
      const { data, error } = await supabase.from("apps").select("id").limit(1);
      if (error) {
        throw error;
      }
      console.log("Supabase connection successful");
    } catch (error) {
      console.error("Supabase connection error:", error.message);
    }
  }

  // Call testConnection to verify connectivity
  testConnection().catch((error) => {
    console.error("Initial connection test failed:", error);
  });

  // Add this after Supabase initialization
  async function loadApps() {
    try {
      console.log("Attempting to load apps...");
      const { data, error } = await supabase.from("apps").select("*");

      if (error) {
        console.error("Error loading apps:", error);
        return;
      }

      console.log("Apps loaded:", data);

      if (data && data.length > 0) {
        apps = data;
        filterApps();
      } else {
        console.log("No apps found in database");
        showNoAppsMessage();
      }
    } catch (error) {
      console.error("Failed to load apps:", error);
      showErrorMessage("Failed to load apps");
    }
  }

  function showNoAppsMessage() {
    const noAppsFound = document.querySelector(".no-apps-found");
    noAppsFound.classList.remove("hidden");
  }

  // Add this to check Supabase connection
  console.log("Supabase client:", supabase);

  // Add error handling
  if (!supabase) {
    console.error("Failed to initialize Supabase client");
    throw new Error("Supabase initialization failed");
  }

  // Helper function to handle Supabase errors
  supabase.handleError = async function (error) {
    if (error) {
      if (error.message === "JWT expired") {
        // Handle expired session
        console.error("Session expired");
        // You can implement session refresh logic here
      } else if (error.code === "42P01") {
        // Handle relation not found
        console.error("Table not found");
      } else {
        // Handle other errors
        console.error("Database error:", error.message);
      }
      throw error;
    }
  };

  // Helper function for common queries
  supabase.queries = {
    // Get all apps
    getAllApps: async function () {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) await this.handleError(error);
      return data;
    },

    // Get apps by category
    getAppsByCategory: async function (category) {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .eq("category", category)
        .order("created_at", { ascending: false });

      if (error) await this.handleError(error);
      return data;
    },

    // Get apps by pricing type
    getAppsByPricing: async function (pricing) {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .eq("pricing", pricing)
        .order("created_at", { ascending: false });

      if (error) await this.handleError(error);
      return data;
    },

    // Search apps
    searchApps: async function (searchTerm) {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false });

      if (error) await this.handleError(error);
      return data;
    },

    // Get recent apps
    getRecentApps: async function (limit = 10) {
      const { data, error } = await supabase
        .from("apps")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) await this.handleError(error);
      return data;
    },
  };

  return supabase;
}

export { initSupabase };
