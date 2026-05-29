import type { BrewPilotParameters } from '@/core/types'

const recipes = {
  install(_vue: any, parameters: BrewPilotParameters) {
    // Páginas
    parameters.putComponent('recipe-list-page', () => import('./RecipeListPage.vue'))
    parameters.putComponent('recipe-editor-page', () => import('./RecipeEditorPage.vue'))

    // Componentes gerais
    parameters.putComponent('recipe-card', () => import('./components/RecipeCard.vue'))
    parameters.putComponent('recipe-section', () => import('./components/RecipeSection.vue'))
    parameters.putComponent('recipe-style-range-bar', () => import('./components/RecipeStyleRangeBar.vue'))
    parameters.putComponent('style-param-bar', () => import('./components/StyleParamBar.vue'))
    parameters.putComponent('recipe-validation-banner', () => import('./components/RecipeValidationBanner.vue'))
    parameters.putComponent('style-bar', () => import('./components/StyleBar.vue'))
    parameters.putComponent('ingredient-picker-dialog', () => import('./components/IngredientPickerDialog.vue'))

    // Abas do editor
    parameters.putComponent('recipe-design-tab', () => import('./tabs/RecipeDesignTab.vue'))
    parameters.putComponent('recipe-fermentables-tab', () => import('./tabs/RecipeFermentablesTab.vue'))
    parameters.putComponent('recipe-hops-tab', () => import('./tabs/RecipeHopsTab.vue'))
    parameters.putComponent('recipe-mash-tab', () => import('./tabs/RecipeMashTab.vue'))
    parameters.putComponent('recipe-misc-tab', () => import('./tabs/RecipeMiscTab.vue'))
    parameters.putComponent('recipe-overview-tab', () => import('./tabs/RecipeOverviewTab.vue'))
    parameters.putComponent('recipe-yeast-tab', () => import('./tabs/RecipeYeastTab.vue'))

    // Cards da visão geral
    parameters.putComponent('fermentables-card', () => import('./components/overview/FermentablesCard.vue'))
    parameters.putComponent('hops-card', () => import('./components/overview/HopsCard.vue'))
    parameters.putComponent('mash-card', () => import('./components/overview/MashCard.vue'))
    parameters.putComponent('others-card', () => import('./components/overview/OthersCard.vue'))
    parameters.putComponent('style-guide-card', () => import('./components/overview/StyleGuideCard.vue'))
    parameters.putComponent('water-card', () => import('./components/overview/WaterCard.vue'))
    parameters.putComponent('yeast-card', () => import('./components/overview/YeastCard.vue'))

    // Dialogs da visão geral
    parameters.putComponent('change-equipment-dialog', () => import('./components/overview/dialogs/ChangeEquipmentDialog.vue'))
    parameters.putComponent('color-adjust-dialog', () => import('./components/overview/dialogs/ColorAdjustDialog.vue'))
    parameters.putComponent('edit-equipment-dialog', () => import('./components/overview/dialogs/EditEquipmentDialog.vue'))
    parameters.putComponent('edit-fermentable-dialog', () => import('./components/overview/dialogs/EditFermentableDialog.vue'))
    parameters.putComponent('fermentable-form-content', () => import('./components/overview/dialogs/FermentableFormContent.vue'))
    parameters.putComponent('fermentable-form-dialog', () => import('./components/overview/dialogs/FermentableFormDialog.vue'))
    parameters.putComponent('recipe-image-dialog', () => import('./components/overview/dialogs/RecipeImageDialog.vue'))
    parameters.putComponent('recipe-style-dialog', () => import('./components/overview/dialogs/RecipeStyleDialog.vue'))
    parameters.putComponent('resize-by-og-dialog', () => import('./components/overview/dialogs/ResizeByOgDialog.vue'))
    parameters.putComponent('resize-equip-dialog', () => import('./components/overview/dialogs/ResizeEquipDialog.vue'))
    parameters.putComponent('set-percentages-dialog', () => import('./components/overview/dialogs/SetPercentagesDialog.vue'))

    // Pickers
    parameters.putComponent('fermentable-picker-dialog', () => import('./components/pickers/FermentablePickerDialog.vue'))
    parameters.putComponent('fermentable-search-step', () => import('./components/pickers/FermentableSearchStep.vue'))
    parameters.putComponent('fermentable-configure-step', () => import('./components/pickers/FermentableConfigureStep.vue'))
    parameters.putComponent('hop-picker-dialog', () => import('./components/pickers/HopPickerDialog.vue'))
    parameters.putComponent('misc-picker-dialog', () => import('./components/pickers/MiscPickerDialog.vue'))
    parameters.putComponent('yeast-picker-dialog', () => import('./components/pickers/YeastPickerDialog.vue'))
  }
}

export default recipes
