// Frontend JS for Notes App - uses safe DOM methods (no inline HTML with unescaped strings)
let editId = null;
let NOTES_CACHE = [];

async function loadNotes() {
  const res = await fetch('/notes');
  const data = await res.json();
  NOTES_CACHE = Array.isArray(data) ? data : [];

  renderNotes(NOTES_CACHE);
}

function renderNotes(list) {
  const box = document.getElementById('notes');
  box.innerHTML = '';

  if (!list || list.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'text-gray-500';
    empty.textContent = 'No notes yet. Create one!';
    box.appendChild(empty);
    return;
  }

  list.forEach(n => {
    const card = document.createElement('div');
    card.className = 'p-4 border rounded-lg bg-white shadow';

    const title = document.createElement('h3');
    title.className = 'font-semibold text-lg';
    title.textContent = n.title || 'Untitled';

    const content = document.createElement('p');
    content.className = 'text-gray-600 mt-2';
    content.textContent = n.content || '';

    const meta = document.createElement('div');
    meta.className = 'mt-4 flex justify-between items-center';

    const left = document.createElement('div');
    left.appendChild(title);
    left.appendChild(content);

    const actions = document.createElement('div');
    actions.className = 'flex gap-2';

    const editBtn = document.createElement('button');
    editBtn.className = 'px-3 py-1 bg-amber-500 text-white rounded';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => openEdit(n.id, n.title, n.content));

    const delBtn = document.createElement('button');
    delBtn.className = 'px-3 py-1 bg-red-500 text-white rounded';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => deleteNote(n.id));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    meta.appendChild(left);
    meta.appendChild(actions);

    card.appendChild(meta);
    box.appendChild(card);
  });
}

async function createNote() {
  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('content').value.trim();

  if (!title && !content) return;

  await fetch('/notes', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({title, content})
  });

  document.getElementById('title').value = '';
  document.getElementById('content').value = '';

  await loadNotes();
}

async function deleteNote(id) {
  await fetch(`/notes/${id}`, { method: 'DELETE' });
  await loadNotes();
}

function openEdit(id, title, content) {
  editId = id;
  document.getElementById('editTitle').value = title;
  document.getElementById('editContent').value = content;
  const label = document.getElementById('editIdLabel');
  if (label) label.textContent = id;
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

async function saveEdit() {
  const title = document.getElementById('editTitle').value.trim();
  const content = document.getElementById('editContent').value.trim();

  if (!editId) return;

  await fetch(`/notes/${editId}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({title, content})
  });

  closeModal();
  await loadNotes();
}

// Wire up buttons after DOM loads
window.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('createBtn');
  if (addBtn) addBtn.addEventListener('click', createNote);

  const saveBtn = document.getElementById('saveEditBtn');
  if (saveBtn) saveBtn.addEventListener('click', saveEdit);

  const cancelBtn = document.getElementById('cancelEditBtn');
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) refreshBtn.addEventListener('click', loadNotes);

  const search = document.getElementById('search');
  if (search) search.addEventListener('input', filterNotes);

  loadNotes();
});

function filterNotes() {
  const q = (document.getElementById('search')?.value || '').toLowerCase().trim();
  if (!q) return renderNotes(NOTES_CACHE);
  const filtered = NOTES_CACHE.filter(n => ((n.title||'')+" "+(n.content||'')).toLowerCase().includes(q));
  renderNotes(filtered);
}
