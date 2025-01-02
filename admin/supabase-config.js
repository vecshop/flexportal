// filepath: /E:/DESIGN PROJECT/LOGO/V'CTOR COMPANY/Website/APPS COLLECTION/apps-collection/admin/supabase-config.js
// Remove Supabase client initialization
// const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Load apps from backend
async function loadApps(silent = false) {
  try {
    const response = await fetch('/api/apps');
    const data = await response.json();
    if (!silent) {
      renderAppList(data);
    }
    return data;
  } catch (error) {
    if (!silent) {
      handleError(error);
    }
    return [];
  }
}

// Add new app via backend
async function addApp(appData) {
  try {
    const response = await fetch('/api/apps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

// Update existing app via backend
async function updateApp(id, appData) {
  try {
    const response = await fetch(`/api/apps/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

// Delete app via backend
async function deleteApp(id) {
  try {
    const response = await fetch(`/api/apps/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

export { loadApps, addApp, updateApp, deleteApp };