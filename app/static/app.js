// Frontend JS for Notes Studio
let editId = null;
let NOTES_CACHE = [];

const notesGrid = document.getElementById('notesGrid');
const searchInput = document.getElementById('search');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const userStatus = document.getElementById('userStatus');
const logoutBtn = document.getElementById('logoutBtn');
const userTokenKey = 'notes_studio_token';
const userEmailKey = 'notes_studio_email';

const statusMessage = document.createElement('div');
statusMessage.className = 'status-message hidden';
if (notesGrid && notesGrid.parentElement) {
  notesGrid.parentElement.insertBefore(statusMessage, notesGrid);
} else {
  document.body.insertBefore(statusMessage, document.body.firstChild);
}

function getAuthHeaders() {
  const token = localStorage.getItem(userTokenKey);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function setStatus(message, error = false) {
  if (!statusMessage) return;
  statusMessage.textContent = message;
  if (!message) {
    statusMessage.classList.add('hidden');
    statusMessage.classList.remove('status-message--error');
    return;
  }
  statusMessage.classList.remove('hidden');
  statusMessage.classList.toggle('status-message--error', error);
}

function setUserState(email) {
  if (userStatus) {
    if (email) {
      userStatus.textContent = `Logged in as ${email}`;
      userStatus.classList.remove('hidden');
    } else {
      userStatus.textContent = '';
      userStatus.classList.add('hidden');
    }
  }

  if (logoutBtn) {
    logoutBtn.style.display = email ? 'inline-flex' : 'none';
  }
}

async function authRequest(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Authentication failed');
  }
  return res.json();
}

async function loginUser() {
  const email = emailInput?.value.trim();
  const password = passwordInput?.value.trim();
  if (!email || !password) {
    setStatus('Enter email and password to login.', true);
    return;
  }
  setStatus('Logging in...');
  try {
    const data = await authRequest('/auth/login', { email, password });
    localStorage.setItem(userTokenKey, data.access_token);
    localStorage.setItem(userEmailKey, email);
    setUserState(email);
    setStatus('Login successful. Redirecting...');
    if (window.location.pathname !== '/dashboard') {
      window.location.href = '/dashboard';
    } else {
      await loadNotes();
    }
  } catch (error) {
    setStatus(error.message, true);
    console.error(error);
  }
}

async function registerUser() {
  const email = emailInput?.value.trim();
  const password = passwordInput?.value.trim();
  if (!email || !password) {
    setStatus('Provide an email and password to register.', true);
    return;
  }
  setStatus('Registering...');
  try {
    await authRequest('/auth/register', { email, password });
    setStatus('Registration successful. Please login.');
  } catch (error) {
    setStatus(error.message, true);
    console.error(error);
  }
}

async function loadNotes() {
  setStatus('Loading notes...');
  try {
    const res = await fetch('/notes', { headers: { ...getAuthHeaders() } });
    if (res.status === 401) {
      setStatus('Login required to access your notes.', true);
      setUserState(localStorage.getItem(userEmailKey) || '');
      renderNotes([]);
      return;
    }
    if (!res.ok) throw new Error('Could not load notes');
    const data = await res.json();
    NOTES_CACHE = Array.isArray(data) ? data : [];
    renderNotes(NOTES_CACHE);
    setStatus('');
  } catch (error) {
    setStatus('Unable to load notes. Please refresh.', true);
    console.error(error);
  }
}

function renderNotes(list) {
  if (!notesGrid) return;
  notesGrid.innerHTML = '';

  if (!list || list.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'note-card';
    empty.textContent = 'No notes available. Add one when you are logged in.';
    notesGrid.appendChild(empty);
    return;
  }

  list.forEach(note => {
    const card = document.createElement('article');
    card.className = 'note-card';

    const title = document.createElement('h3');
    title.textContent = note.title || 'Untitled';

    const content = document.createElement('p');
    content.textContent = note.content || 'No additional details.';

    const footer = document.createElement('div');
    footer.className = 'note-card__footer';

    const actions = document.createElement('div');
    actions.className = 'note-card__actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'button button-link';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => openEdit(note.id, note.title, note.content));

    const delBtn = document.createElement('button');
    delBtn.className = 'button button-danger';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => deleteNote(note.id));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    footer.appendChild(actions);

    card.appendChild(title);
    card.appendChild(content);
    card.appendChild(footer);
    notesGrid.appendChild(card);
  });
}

async function createNote() {
  const title = document.getElementById('title')?.value.trim();
  const content = document.getElementById('content')?.value.trim();
  if (!title && !content) {
    setStatus('Please enter a title or content before saving.', true);
    return;
  }
  setStatus('Saving note...');
  try {
    const res = await fetch('/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ title, content })
    });
    if (res.status === 401) {
      setStatus('Login required to create notes.', true);
      return;
    }
    if (!res.ok) throw new Error('Save failed');
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    await loadNotes();
  } catch (error) {
    setStatus('Unable to save note.', true);
    console.error(error);
  }
}

async function deleteNote(id) {
  if (!confirm('Delete this note?')) return;
  setStatus('Deleting note...');
  try {
    const res = await fetch(`/notes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.status === 401) {
      setStatus('Login required to delete notes.', true);
      return;
    }
    if (!res.ok) throw new Error('Delete failed');
    await loadNotes();
  } catch (error) {
    setStatus('Unable to delete note.', true);
    console.error(error);
  }
}

function openEdit(id, title, content) {
  editId = id;
  document.getElementById('editTitle').value = title || '';
  document.getElementById('editContent').value = content || '';
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  editId = null;
}

async function saveEdit() {
  const title = document.getElementById('editTitle')?.value.trim();
  const content = document.getElementById('editContent')?.value.trim();
  if (!editId) return;
  setStatus('Saving changes...');
  try {
    const res = await fetch(`/notes/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ title, content })
    });
    if (res.status === 401) {
      setStatus('Login required to edit notes.', true);
      closeModal();
      return;
    }
    if (!res.ok) throw new Error('Update failed');
    closeModal();
    await loadNotes();
  } catch (error) {
    setStatus('Unable to save changes.', true);
    console.error(error);
  }
}

function filterNotes() {
  const query = (searchInput?.value || '').toLowerCase().trim();
  if (!query) return renderNotes(NOTES_CACHE);
  renderNotes(NOTES_CACHE.filter(note => `${note.title || ''} ${note.content || ''}`.toLowerCase().includes(query)));
}

function logout() {
  localStorage.removeItem(userTokenKey);
  localStorage.removeItem(userEmailKey);
  setUserState('');
  setStatus('Logged out. Please login to continue.');
  if (notesGrid) renderNotes([]);
  if (window.location.pathname === '/dashboard') {
    setTimeout(() => window.location.href = '/', 1200);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('createBtn');
  if (addBtn) addBtn.addEventListener('click', createNote);

  const saveBtn = document.getElementById('saveEditBtn');
  if (saveBtn) saveBtn.addEventListener('click', saveEdit);

  const cancelBtn = document.getElementById('cancelEditBtn');
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) refreshBtn.addEventListener('click', loadNotes);

  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.addEventListener('click', loginUser);

  const registerBtn = document.getElementById('registerBtn');
  if (registerBtn) registerBtn.addEventListener('click', registerUser);

  if (logoutBtn) logoutBtn.addEventListener('click', logout);
  if (searchInput) searchInput.addEventListener('input', filterNotes);

  const savedEmail = localStorage.getItem(userEmailKey);
  setUserState(savedEmail);
  if (window.location.pathname === '/dashboard') {
    loadNotes();
  }
});
