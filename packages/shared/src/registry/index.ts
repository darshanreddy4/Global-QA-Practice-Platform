import { ChallengeDefinitionSchema, type ChallengeDefinition } from "../challenge-schema";
import { basicUiActionsChallenges } from "./challenges/basic-ui-actions";
import { inputControlsChallenges } from "./challenges/input-controls";
import { dropdownsChallenges } from "./challenges/dropdowns";
import { buttonsChallenges } from "./challenges/buttons";
import { authenticationChallenges } from "./challenges/authentication";
import { errorHandlingChallenges } from "./challenges/error-handling";
import { linksNavigationChallenges } from "./challenges/links-navigation";
import { menusNavigationChallenges } from "./challenges/menus-navigation";
import { mouseActionsChallenges } from "./challenges/mouse-actions";
import { dragDropChallenges } from "./challenges/drag-drop";
import { tablesGridsChallenges } from "./challenges/tables-grids";
import { listsCardsChallenges } from "./challenges/lists-cards";
import { tabsChallenges } from "./challenges/tabs";
import { accordionsChallenges } from "./challenges/accordions";
import { modalsDialogsChallenges } from "./challenges/modals-dialogs";
import { alertsNotificationsChallenges } from "./challenges/alerts-notifications";
import { tooltipsHoverChallenges } from "./challenges/tooltips-hover";
import { dateTimeChallenges } from "./challenges/date-time";
import { fileUploadChallenges } from "./challenges/file-upload";
import { fileDownloadChallenges } from "./challenges/file-download";
import { imagesMediaChallenges } from "./challenges/images-media";
import { slidersCarouselsChallenges } from "./challenges/sliders-carousels";
import { scrollBehaviorsChallenges } from "./challenges/scroll-behaviors";
import { dynamicElementsChallenges } from "./challenges/dynamic-elements";
import { dynamicXPathChallenges } from "./challenges/dynamic-xpath";
import { movingElementsChallenges } from "./challenges/moving-elements";
import { ajaxAsyncChallenges } from "./challenges/ajax-async";
import { waitSyncChallenges } from "./challenges/wait-sync";
import { virtualizedListsChallenges } from "./challenges/virtualized-lists";
import { browserWindowsTabsChallenges } from "./challenges/browser-windows-tabs";
import { iframeLabChallenges } from "./challenges/iframe-lab";
import { shadowDomChallenges } from "./challenges/shadow-dom";
import { cookiesChallenges } from "./challenges/cookies";
import { browserStorageChallenges } from "./challenges/browser-storage";
import { popupsChallenges } from "./challenges/popups";
import { networkApiTestingChallenges } from "./challenges/network-api-testing";
import { apiInterceptionMockingChallenges } from "./challenges/api-interception-mocking";
import { apiDrivenUiChallenges } from "./challenges/api-driven-ui";
import { realApplicationsChallenges } from "./challenges/real-applications";
import { nightmareDomChallenges } from "./challenges/nightmare-dom";
import { internationalizationChallenges } from "./challenges/internationalization";

export const challengeRegistry: ChallengeDefinition[] = [
  ...basicUiActionsChallenges,
  ...inputControlsChallenges,
  ...dropdownsChallenges,
  ...buttonsChallenges,
  ...authenticationChallenges,
  ...errorHandlingChallenges,
  ...linksNavigationChallenges,
  ...menusNavigationChallenges,
  ...mouseActionsChallenges,
  ...dragDropChallenges,
  ...tablesGridsChallenges,
  ...listsCardsChallenges,
  ...tabsChallenges,
  ...accordionsChallenges,
  ...modalsDialogsChallenges,
  ...alertsNotificationsChallenges,
  ...tooltipsHoverChallenges,
  ...dateTimeChallenges,
  ...fileUploadChallenges,
  ...fileDownloadChallenges,
  ...imagesMediaChallenges,
  ...slidersCarouselsChallenges,
  ...scrollBehaviorsChallenges,
  ...dynamicElementsChallenges,
  ...dynamicXPathChallenges,
  ...movingElementsChallenges,
  ...ajaxAsyncChallenges,
  ...waitSyncChallenges,
  ...virtualizedListsChallenges,
  ...browserWindowsTabsChallenges,
  ...iframeLabChallenges,
  ...shadowDomChallenges,
  ...cookiesChallenges,
  ...browserStorageChallenges,
  ...popupsChallenges,
  ...networkApiTestingChallenges,
  ...apiInterceptionMockingChallenges,
  ...apiDrivenUiChallenges,
  ...realApplicationsChallenges,
  ...nightmareDomChallenges,
  ...internationalizationChallenges,
];

/** Fails loudly if any hardcoded challenge drifts from the shared schema (spec §9). */
export function validateChallengeRegistry(): { id: string; errors: string }[] {
  const problems: { id: string; errors: string }[] = [];
  for (const challenge of challengeRegistry) {
    const result = ChallengeDefinitionSchema.safeParse(challenge);
    if (!result.success) {
      problems.push({ id: challenge.id, errors: result.error.message });
    }
  }
  return problems;
}

export function getChallengeById(id: string): ChallengeDefinition | undefined {
  return challengeRegistry.find((c) => c.id === id);
}

export function getChallengesByCategory(categoryId: string): ChallengeDefinition[] {
  return challengeRegistry.filter((c) => c.categoryId === categoryId && c.isActive);
}

export * from "./categories";
