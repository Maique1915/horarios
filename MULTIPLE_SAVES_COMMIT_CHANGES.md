# Multiple Saves and Commit Changes Feature in EditDb.jsx

## Original Problem

The user reported that the commit system in `EditDb.jsx` was only processing one modification at a time. If multiple changes were made to the same discipline (e.g., editing it twice), only the last change was being saved. The system also lacked proper handling for saving multiple queued changes to the backend and providing progress feedback to the user.

## User's Request

The user requested the following:
1.  When a discipline is modified multiple times in the frontend, these changes should be merged into a single pending change entry for that discipline in the commit queue. This means if a discipline `X` is modified from state `A` to `A'` and then to `A''`, the commit queue should only contain one entry for `X` reflecting the final state `A''` against the original state `A`.
2.  The "Commit" button should process all pending changes in the queue, saving them sequentially to the backend.
3.  During the multi-save process, a progress indicator should be displayed, showing how many changes have been saved out of the total.
4.  The form should allow visualizing a pending change from the commit queue.

## Proposed Solution and Implementation Details

The solution involves several modifications to `EditDb.jsx` and `DisciplinaForm.jsx` to manage a queue of changes, merge subsequent modifications to the same item, and implement a sequential saving process with progress feedback.

### 1. Change Queue Management (`queueChange` function in `EditDb.jsx`)

The core of handling multiple modifications to the same item lies in the `queueChange` function. This function was enhanced to:
-   **Identify Unique Changes**: Each pending change (add, update, delete) is associated with a unique discipline identifier (e.g., `_re`).
-   **Merge Updates**: If an "update" action occurs for a discipline that already has a pending change in the queue:
    -   If the existing change was an "add", the new data from the update is merged into the existing "add" entry. The original data (for diffing) remains the state before the "add".
    -   If the existing change was another "update", the new data from the latest update completely replaces the data of the previous update for that discipline. The `originalData` field, used for diffing, retains the state of the discipline as it was *before the very first modification* that led to its presence in the queue.
-   **Handle Deletes**:
    -   An "add" followed by a "delete" for the same discipline cancels each other out, removing the entry from the queue.
    -   A "delete" overwriting an "update" results in the item being marked for deletion.
    -   An "add" or "update" overwriting a "delete" effectively "restores" the item, changing the action type to "add" with the latest data.
-   **`originalData` Preservation**: For "update" and "delete" actions, the original state of the discipline (before the modification) is stored in the `originalData` property of the change object. This is crucial for displaying a meaningful diff in the commit panel.

**Specific changes in `queueChange` (EditDb.jsx):**

```javascript
  const queueChange = (type, payload) => {
    setPendingChanges(prev => {
        const newChanges = [...prev];
        const currentId = `${Date.now()}-${Math.random()}`;
        const identifier = payload.reference || (payload.data ? payload.data._re : null);

        if (!identifier) {
            console.warn("Change queued without identifier:", type, payload);
            return [...newChanges, { id: currentId, type, ...payload }];
        }

        const existingIndex = newChanges.findIndex(change => {
            const changeIdentifier = change.reference || (change.data ? change.data._re : null);
            return changeIdentifier === identifier;
        });

        if (existingIndex > -1) {
            const existingChange = newChanges[existingIndex];

            // Case 1: New change is a 'delete'
            if (type === 'delete') {
                if (existingChange.type === 'add') {
                    // 'add' followed by 'delete' cancels out. Remove from queue.
                    newChanges.splice(existingIndex, 1);
                } else {
                    // Any other existing change ('update') is replaced by 'delete'.
                    newChanges[existingIndex] = {
                        id: currentId,
                        type: 'delete',
                        reference: identifier,
                        originalData: existingChange.originalData || payload.originalData // Preserve original for display
                    };
                }
            } 
            // Case 2: Existing change was a 'delete'
            else if (existingChange.type === 'delete') {
                // A 'delete' is being overwritten by an 'add' or 'update'.
                // This is like restoring the item, so it becomes an 'add' with the new data.
                 newChanges[existingIndex] = {
                    id: currentId,
                    type: 'add',
                    data: payload.data,
                    // The originalData of the delete is the new originalData
                    originalData: existingChange.originalData
                };
            }
            // Case 3: Other combinations (add -> update, update -> update)
            else {
                newChanges[existingIndex] = {
                    ...existingChange,
                    id: currentId,
                    // data is a merge of existing and new data
                    data: { ...existingChange.data, ...payload.data },
                    // type remains what it was, usually 'add' or 'update'
                    type: existingChange.type, 
                };
            }
            return newChanges;
        } else {
            // No existing change, add as new.
            return [...newChanges, { id: currentId, type, ...payload }];
        }
    });
  };
```

### 2. Multi-Save with Progress Indicator (`commitChanges` function in `EditDb.jsx`)

The `commitChanges` function was refactored to iterate through the `pendingChanges` queue, sending each change individually to the backend (Google Apps Script). This addresses the limitation of the backend not handling batch updates.

-   **Sequential Saving**: A `for` loop processes each change in `pendingChanges`.
-   **Progress Feedback**: A new `progressMessage` state variable is introduced and updated during the loop, providing real-time feedback to the user via the `SavingSpinner`.
-   **Error Handling**: Each save operation is wrapped in a `try...catch` block. Failed changes are collected in a `failedChanges` array and remain in the `pendingChanges` queue after the commit attempt, allowing the user to re-attempt or discard them.
-   **Single Reload**: Data is reloaded from the backend only once after all save attempts (successful or failed) to ensure data consistency.

**Specific changes in `commitChanges` (EditDb.jsx):**

```javascript
  const [progressMessage, setProgressMessage] = useState(''); // New state for progress

  const commitChanges = async () => {
    if (pendingChanges.length === 0) {
      alert("Nenhuma alteração pendente.");
      return;
    }
    setCommitting(true); // Disables commit button
    setSyncing(true); // Shows spinner
    
    const totalChanges = pendingChanges.length;
    let savedCount = 0;
    const failedChanges = [];

    for (let i = 0; i < totalChanges; i++) {
        const change = pendingChanges[i];
        setProgressMessage(`Salvando ${i + 1} de ${totalChanges}...`);
        
        try {
            const { type, id, ...payload } = change;
            // Assumed backend actions are 'add', 'update', 'delete' directly
            await saveToGoogleSheets(type, payload, { reload: false, manageSyncState: false });
            savedCount++;
        } catch (error) {
            console.error(`Erro ao salvar a alteração ${change.id}:`, error);
            failedChanges.push(change);
        }
    }

    setSyncing(false);
    setCommitting(false);
    setProgressMessage('');
    
    // Update pending changes to only contain the ones that failed
    setPendingChanges(failedChanges);

    if (failedChanges.length > 0) {
        alert(`Operação finalizada. ${savedCount}/${totalChanges} alterações salvas. ${failedChanges.length} falharam e permanecem na fila.`);
    } else {
        alert(`Sucesso! Todas as ${totalChanges} alterações foram salvas. Recarregando dados...`);
        setIsQueueOpen(false); // Close queue only on full success
    }

    // Reload data at the end regardless
    clearCache();
    const db = await loadDbData();
    const filteredDb = db.filter(d => d._cu === cur).map(d => ({ ...d, _da: d._da || [] }));
    setReferenceDisciplinas(filteredDb);
    setDisciplinas(JSON.parse(JSON.stringify(filteredDb)));
  };

// Update SavingSpinner usage in JSX
{syncing && <SavingSpinner message={progressMessage || "Salvando no Google Sheets..."} />}
```

### 3. Visualizing Pending Changes in `DisciplinaForm.jsx`

To allow users to review a pending change before committing, the `DisciplinaForm` was extended with a "review mode":

-   **`isReviewing` Prop**: A new `isReviewing` prop is passed from `EditDb.jsx` to `DisciplinaForm.jsx`.
-   **Form Inputs Disabled**: When `isReviewing` is `true`, all form fields (inputs, selects, toggles, checkboxes) within `DisciplinaForm` are disabled, preventing accidental edits during review.
-   **Modified Buttons**: The "Salvar Alterações" and "Cancelar" buttons are replaced by a single "Fechar" button when in review mode.
-   **Triggering Review Mode**: Clicking on a pending change in the "Commit" panel triggers this review mode, populating the `DisciplinaForm` with the final state (`change.data`) of the selected pending change.

**Specific changes in `DisciplinaForm.jsx`:**

-   Accept `isReviewing` prop: `const DisciplinaForm = ({ ..., isReviewing }) => { ... }`
-   Apply `disabled={isReviewing}` to all input fields (`<input>`, `<Select>`, `Toggle` component).
-   Conditional rendering for form action buttons:
    ```jsx
    {isReviewing ? (
        <button
          className="..."
          type="button"
          onClick={onCancel} // onCancel now resets isReviewing in EditDb
        >
          <span className="truncate">Fechar</span>
        </button>
    ) : (
        // Original Salvar and Cancelar buttons
    )}
    ```

### 4. Prerequisites Filtering in `DisciplinaForm.jsx`

The "Pré-requisitos" `Select` in `DisciplinaForm.jsx` was modified to only show disciplines from previous semesters, preventing illogical prerequisite selections.

**Specific changes in `DisciplinaForm.jsx` (`getPrerequisiteOptions` function):**

```javascript
  const getPrerequisiteOptions = useCallback(() => {
    if (!disciplinas) return [];
    const currentSemester = watch('_se'); // Get current semester from form
    // Filter for active disciplines from previous semesters
    const activeDisciplinas = disciplinas.filter(d => d._ag && d._se < currentSemester);
    const uniquePrerequisites = Array.from(new Set(activeDisciplinas.map(d => d._re)));
    return uniquePrerequisites.map(re => ({ value: re, label: `${re} - ${activeDisciplinas.find(d => d._re === re)?._di || ''}` }));
  }, [disciplinas, watch]);
```

## Potential Issues / Next Steps

-   **Backend (`APPS_SCRIPT_URL`) Compatibility**: The `commitChanges` function now sends individual `add`, `update`, or `delete` actions. The Google Apps Script backend at `APPS_SCRIPT_URL` needs to be capable of handling these distinct actions and their respective payloads. The previous assumption was that a single `batchUpdate` action could process the entire `pendingChanges` array. If the backend is not set up for `add`, `update`, `delete` actions individually, this will cause issues.
-   **`no-cors` limitation**: Due to `mode: 'no-cors'`, the frontend cannot read the actual response from the Apps Script. This means success or failure must be inferred or handled by other means (e.g., visual feedback, retries based on internal flags). True error feedback would require a proxy or a backend modification to allow CORS.
-   **Transactionality**: The current individual saving approach is not transactional. If one save fails in the middle of a batch, previous successful saves are not rolled back. This is a limitation inherent in the one-by-one approach.
-   **User Experience for Failures**: While `failedChanges` remain in the queue, the UX for retrying or inspecting specific failures could be improved.
