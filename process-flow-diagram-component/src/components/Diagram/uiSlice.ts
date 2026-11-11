import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { ManageDataTab } from 'process-flow-lib';
import { ValidationWindowLocation } from './ValidationWindow';
import { DiagramAlertState } from './DiagramAlert';
import { deleteNode, deleteEdge, diagramInitialized, resetDiagram, applyEstimatedFlowResults } from './diagramReducer';

/**
 * UI-only state for the diagram: drawer/dialog/modal open state, the manage-data-tabs derived from
 * whichever node/edge is selected, the validation window, and the alert banner. None of this needs
 * to update atomically with `nodes`/`edges`/`calculatedData` (the diagramSlice), so it's kept in a
 * separate slice.
 */
export interface DiagramUiState {
  isDataDrawerOpen: boolean,
  isMenuDrawerOpen: boolean,
  manageDataTabs: ManageDataTab[],
  isDialogOpen: boolean,
  isModalOpen: boolean,
  validationWindowLocation: ValidationWindowLocation,
  diagramAlert: DiagramAlertState,
}

export const getDefaultDiagramUiState = (currentState?: DiagramUiState): DiagramUiState => ({
  isDataDrawerOpen: false,
  isMenuDrawerOpen: currentState?.isMenuDrawerOpen ?? true,
  manageDataTabs: [],
  isDialogOpen: false,
  isModalOpen: false,
  validationWindowLocation: 'diagram',
  diagramAlert: {
    open: false,
  },
});

export const uiSlice = createSlice({
  name: 'ui',
  initialState: getDefaultDiagramUiState(),
  reducers: {
    toggleDrawer: (state) => {
      state.isDataDrawerOpen = !state.isDataDrawerOpen;
    },
    openDataDrawer: (state) => {
      state.isDataDrawerOpen = true;
    },
    toggleMenuDrawer: (state) => {
      state.isMenuDrawerOpen = !state.isMenuDrawerOpen;
    },
    setManageDataTabs: (state, action: PayloadAction<ManageDataTab[]>) => {
      state.manageDataTabs = action.payload;
    },
    setDialogOpen: (state) => {
      state.isDialogOpen = !state.isDialogOpen;
    },
    modalOpenChange: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
    validationWindowOpenChange: (state, action: PayloadAction<ValidationWindowLocation>) => {
      state.validationWindowLocation = action.payload;
    },
    diagramAlertChange: (state, action: PayloadAction<DiagramAlertState>) => {
      state.diagramAlert = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // * deleting the selected node/edge closes the drawer it was open in
      .addCase(deleteNode, (state) => {
        state.isDataDrawerOpen = !state.isDataDrawerOpen;
      })
      .addCase(deleteEdge, (state) => {
        state.isDataDrawerOpen = !state.isDataDrawerOpen;
      })
      // * applying estimated flow results closes the estimation modal that produced them
      .addCase(applyEstimatedFlowResults, (state) => {
        state.isModalOpen = false;
      })
      // * a freshly (re)initialized diagram starts with every UI surface closed/reset
      .addCase(diagramInitialized, (state) => {
        state.isDataDrawerOpen = false;
        state.isMenuDrawerOpen = state.isMenuDrawerOpen ?? true;
        state.isDialogOpen = false;
        state.validationWindowLocation = 'diagram';
      })
      .addCase(resetDiagram, () => getDefaultDiagramUiState());
  },
});

export const {
  toggleDrawer,
  openDataDrawer,
  toggleMenuDrawer,
  setManageDataTabs,
  setDialogOpen,
  modalOpenChange,
  validationWindowOpenChange,
  diagramAlertChange,
} = uiSlice.actions;
export default uiSlice.reducer;
