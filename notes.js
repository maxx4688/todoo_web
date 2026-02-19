// Notes Management Module

const Notes = {
    notes: [],
    unsubscribe: null,
    currentNoteId: null,

    init() {
        // Will be called when user is authenticated
    },

    loadNotes() {
        try{
            Loading.show();
            const loadingText = document.getElementById('notes-loading');
            if (loadingText) {
                loadingText.classList.remove('hidden');
            }
        const userId = Auth.getUserId();
        if (!userId) {
            console.error('No user ID available');
            return;
        }

        // Unsubscribe from previous listener if exists
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        // Set up real-time listener
        this.unsubscribe = window.firebaseDb
            .collection('users')
            .doc(userId)
            .collection('notes')
            .orderBy('createdTime', 'desc')
            .onSnapshot((snapshot) => {
                this.notes = [];
                snapshot.forEach((doc) => {
                    this.notes.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                this.renderNotes();
                const loadingTextInner = document.getElementById('notes-loading');
                if (loadingTextInner) {
                    loadingTextInner.classList.add('hidden');
                }
            }, (error) => {
                console.error('Error loading notes:', error);
                Toast.error('Failed to load notes');
            });

        } catch (error) {
            console.error('Error loading notes:', error);
            Toast.error('Failed to load notes');
        } finally {
            Loading.hide();
        }
    },

    async addNote(title, content, isFav, checklist = null) {
        try {
            Loading.show();
            const userId = Auth.getUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const noteData = {
                noteTitle: title,
                noteContent: content,
                createdTime: firebase.firestore.FieldValue.serverTimestamp(),
                editedTime: firebase.firestore.FieldValue.serverTimestamp(),
                isFav: isFav || false
            };

            if (checklist && checklist.length > 0) {
                noteData.checklist = checklist;
            }

            await window.firebaseDb
                .collection('users')
                .doc(userId)
                .collection('notes')
                .add(noteData);

            Toast.success('Note added successfully!');
            return true;
        } catch (error) {
            console.error('Error adding note:', error);
            Toast.error('Failed to add note: ' + error.message);
            return false;
        } finally {
            Loading.hide();
        }
    },

    async updateNote(noteId, title, content, isFav, checklist = null) {
        try {
            Loading.show();
            const userId = Auth.getUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const updateData = {
                noteTitle: title,
                noteContent: content,
                editedTime: firebase.firestore.FieldValue.serverTimestamp(),
                isFav: isFav || false
            };

            // Handle checklist
            const noteRef = window.firebaseDb
                .collection('users')
                .doc(userId)
                .collection('notes')
                .doc(noteId);

            const noteDoc = await noteRef.get();
            const hasExistingChecklist = noteDoc.exists && noteDoc.data().checklist;

            if (checklist && checklist.length > 0) {
                updateData.checklist = checklist;
            } else if (hasExistingChecklist) {
                updateData.checklist = firebase.firestore.FieldValue.delete();
            }

            await noteRef.update(updateData);

            Toast.success('Note updated successfully!');
            return true;
        } catch (error) {
            console.error('Error updating note:', error);
            Toast.error('Failed to update note: ' + error.message);
            return false;
        } finally {
            Loading.hide();
        }
    },

    async updateChecklistItem(noteId, index, isChecked) {
        try {
            const userId = Auth.getUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const noteRef = window.firebaseDb
                .collection('users')
                .doc(userId)
                .collection('notes')
                .doc(noteId);

            const noteDoc = await noteRef.get();
            if (noteDoc.exists) {
                const data = noteDoc.data();
                const checklist = data.checklist || [];
                if (index < checklist.length) {
                    checklist[index].isChecked = isChecked;
                    await noteRef.update({
                        checklist: checklist,
                        editedTime: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            }
        } catch (error) {
            console.error('Error updating checklist item:', error);
            Toast.error('Failed to update checklist item');
        }
    },

    async deleteNote(noteId) {
        try {
            Loading.show();
            const userId = Auth.getUserId();
            if (!userId) {
                throw new Error('User not authenticated');
            }

            await window.firebaseDb
                .collection('users')
                .doc(userId)
                .collection('notes')
                .doc(noteId)
                .delete();

            Toast.success('Note deleted successfully!');
            return true;
        } catch (error) {
            console.error('Error deleting note:', error);
            Toast.error('Failed to delete note: ' + error.message);
            return false;
        } finally {
            Loading.hide();
        }
    },

    async toggleFavorite(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;

        const newFavStatus = !note.isFav;
        await this.updateNote(noteId, note.noteTitle, note.noteContent, newFavStatus, note.checklist);
    },

    renderNotes() {
        const container = document.getElementById('notes-list');
        const emptyState = document.getElementById('empty-state');
        
        if (!container) return;

        if (this.notes.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');
        container.innerHTML = '';

        this.notes.forEach((note, index) => {
            const noteCard = this.createNoteCard(note, index);
            container.appendChild(noteCard);
        });
    },

    createNoteCard(note, index) {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.dataset.noteId = note.id;

        const checklist = note.checklist || [];
        const checkedCount = checklist.filter(item => item.isChecked).length;
        const urls = URLUtils.extractUrls(note.noteContent);
        const textWithoutUrls = URLUtils.getTextWithoutUrls(note.noteContent);

        card.innerHTML = `
            <div class="note-header">
                <div class="note-avatar">${index + 1}</div>
                <div class="note-title">${this.escapeHtml(note.noteTitle)}</div>
            </div>
            ${textWithoutUrls ? `<div class="note-content-preview">${this.escapeHtml(textWithoutUrls)}</div>` : ''}
            ${checklist.length > 0 ? `
                <div class="note-checklist-preview">
                    <span>✓</span>
                    <span>${checkedCount}/${checklist.length} done</span>
                </div>
            ` : ''}
            ${urls.length > 0 ? `<div class="note-urls"></div>` : ''}
            <div class="note-actions">
                <div class="note-action-buttons">
                    <button class="note-action-btn edit-note-btn" data-note-id="${note.id}">✏️</button>
                    <button class="note-favorite-btn ${note.isFav ? 'favorited' : ''}" data-note-id="${note.id}">
                        ${note.isFav ? '❤️' : '♡'}
                    </button>
                </div>
                <button class="note-delete-btn" data-note-id="${note.id}">Delete</button>
            </div>
        `;

        // Add URL elements
        if (urls.length > 0) {
            const urlsContainer = card.querySelector('.note-urls');
            urls.forEach(url => {
                const urlElement = URLUtils.createUrlElement(url);
                urlsContainer.appendChild(urlElement);
            });
        }

        // Event listeners
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                this.viewNote(note.id);
            }
        });

        card.querySelector('.edit-note-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editNote(note.id);
        });

        card.querySelector('.note-favorite-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(note.id);
        });

        card.querySelector('.note-delete-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.confirmDelete(note.id, note.noteContent);
        });

        return card;
    },

    viewNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;

        this.currentNoteId = noteId;
        PageManager.showPage('view-note-page');

        // Populate view note page
        document.getElementById('view-note-title').textContent = note.noteTitle;
        
        const bodyContainer = document.getElementById('view-note-body');
        const urls = URLUtils.extractUrls(note.noteContent);
        const textWithoutUrls = URLUtils.getTextWithoutUrls(note.noteContent);

        if (textWithoutUrls) {
            const textElement = document.createElement('div');
            textElement.textContent = textWithoutUrls;
            bodyContainer.innerHTML = '';
            bodyContainer.appendChild(textElement);
        }

        if (urls.length > 0) {
            const urlsContainer = document.createElement('div');
            urlsContainer.className = 'view-note-urls';
            urls.forEach(url => {
                urlsContainer.appendChild(URLUtils.createViewUrlElement(url));
            });
            bodyContainer.appendChild(urlsContainer);
        }

        // Checklist
        const checklistContainer = document.getElementById('view-note-checklist');
        if (note.checklist && note.checklist.length > 0) {
            checklistContainer.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span>✓</span>
                    <span style="font-weight: bold; color: var(--theme-color);">Checklist</span>
                </div>
            `;
            note.checklist.forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'view-checklist-item';
                itemDiv.innerHTML = `
                    <input type="checkbox" ${item.isChecked ? 'checked' : ''} data-index="${index}">
                    <span class="view-checklist-item-text ${item.isChecked ? 'checked' : ''}">${this.escapeHtml(item.text)}</span>
                `;
                itemDiv.querySelector('input').addEventListener('change', (e) => {
                    this.updateChecklistItem(noteId, index, e.target.checked);
                });
                checklistContainer.appendChild(itemDiv);
            });
        } else {
            checklistContainer.innerHTML = '';
        }

        // Timestamps
        const timestampsContainer = document.getElementById('view-note-timestamps');
        const createdTime = note.createdTime ? DateUtils.formatTimestamp(note.createdTime) : 'null';
        const editedTime = note.editedTime ? DateUtils.formatTimestamp(note.editedTime) : 'null';
        
        timestampsContainer.innerHTML = `
            ${editedTime !== createdTime ? `<div>Edited at: ${editedTime}</div>` : ''}
            <div>Created at: ${createdTime}</div>
        `;

        // Favorite button
        const favBtn = document.getElementById('view-note-favorite-btn');
        favBtn.textContent = note.isFav ? '❤️' : '♡';
        favBtn.onclick = () => {
            this.toggleFavorite(noteId);
        };

        // Share button
        document.getElementById('view-note-share-btn').onclick = () => {
            if (navigator.share) {
                navigator.share({
                    title: note.noteTitle,
                    text: note.noteContent
                });
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(note.noteContent);
                Toast.success('Note copied to clipboard!');
            }
        };
    },

    editNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;

        this.currentNoteId = noteId;
        this.openNoteModal(note);
    },

    openNoteModal(note = null) {
        const modal = document.getElementById('note-modal');
        const isEdit = note !== null;

        document.getElementById('note-modal-title').textContent = isEdit ? 'Edit your todoo..' : 'Add new Note..';
        document.getElementById('note-title-input').value = note ? note.noteTitle : '';
        document.getElementById('note-content-input').value = note ? note.noteContent : '';
        
        const favBtn = document.getElementById('note-favorite-btn');
        favBtn.textContent = (note && note.isFav) ? '❤️' : '♡';
        favBtn.classList.toggle('favorited', note && note.isFav);

        // Checklist
        const checklistContainer = document.getElementById('checklist-items');
        checklistContainer.innerHTML = '';
        if (note && note.checklist) {
            note.checklist.forEach((item, index) => {
                this.addChecklistItemToModal(item.text, item.isChecked, index);
            });
        }

        PageManager.showModal('note-modal');
    },

    addChecklistItemToModal(text, isChecked = false, index = null) {
        const container = document.getElementById('checklist-items');
        const itemDiv = document.createElement('div');
        itemDiv.className = 'checklist-item';
        const itemIndex = index !== null ? index : container.children.length;
        itemDiv.innerHTML = `
            <input type="checkbox" ${isChecked ? 'checked' : ''}>
            <span class="checklist-item-text ${isChecked ? 'checked' : ''}">${this.escapeHtml(text)}</span>
            <button class="checklist-item-remove">✕</button>
        `;
        
        itemDiv.querySelector('input').addEventListener('change', (e) => {
            const textSpan = itemDiv.querySelector('.checklist-item-text');
            textSpan.classList.toggle('checked', e.target.checked);
        });

        itemDiv.querySelector('.checklist-item-remove').addEventListener('click', () => {
            itemDiv.remove();
        });

        container.appendChild(itemDiv);
    },

    async saveNote() {
        const title = document.getElementById('note-title-input').value.trim();
        const content = document.getElementById('note-content-input').value.trim();
        const favBtn = document.getElementById('note-favorite-btn');
        const isFav = favBtn.classList.contains('favorited');

        if (!title && !content) {
            Toast.error('Title or content is required');
            return;
        }

        // Get checklist items
        const checklistItems = Array.from(document.querySelectorAll('#checklist-items .checklist-item')).map(item => {
            return {
                text: item.querySelector('.checklist-item-text').textContent,
                isChecked: item.querySelector('input[type="checkbox"]').checked
            };
        }).filter(item => item.text.trim() !== '');

        const checklist = checklistItems.length > 0 ? checklistItems : null;

        let success;
        if (this.currentNoteId) {
            success = await this.updateNote(this.currentNoteId, title, content, isFav, checklist);
        } else {
            success = await this.addNote(title, content, isFav, checklist);
        }

        if (success) {
            PageManager.hideModal('note-modal');
            this.currentNoteId = null;
            // Clear form
            document.getElementById('note-title-input').value = '';
            document.getElementById('note-content-input').value = '';
            document.getElementById('checklist-items').innerHTML = '';
        }
    },

    confirmDelete(noteId, content) {
        if (confirm(`Are you sure you want to delete this todoo?\n\n${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`)) {
            this.deleteNote(noteId);
        }
    },

    searchNotes(query) {
        if (!query.trim()) {
            this.renderNotes();
            return;
        }

        const filtered = this.notes.filter(note => {
            const title = note.noteTitle.toLowerCase();
            const content = note.noteContent.toLowerCase();
            const searchQuery = query.toLowerCase();
            return title.includes(searchQuery) || content.includes(searchQuery);
        });

        const container = document.getElementById('notes-list');
        const emptyState = document.getElementById('empty-state');
        
        if (filtered.length === 0) {
            container.innerHTML = '';
            if (emptyState) {
                emptyState.textContent = "Todooo doesn't exist";
                emptyState.classList.remove('hidden');
            }
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');
        container.innerHTML = '';

        filtered.forEach((note, index) => {
            const noteCard = this.createNoteCard(note, index);
            container.appendChild(noteCard);
        });
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    cleanup() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.notes = [];
    }
};

// Export
window.Notes = Notes;
