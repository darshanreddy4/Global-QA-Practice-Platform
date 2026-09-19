import React from "react";
import type { ChallengeDefinition } from "@qaplatform/shared";
import { ActionSurface } from "./action-surface/ActionSurface";
import { TextInputEngine } from "./text-input/TextInputEngine";
import { DropdownEngine } from "./dropdown/DropdownEngine";
import { ButtonEngine } from "./button/ButtonEngine";
import { AuthPanelEngine } from "./auth-panel/AuthPanelEngine";
import { ErrorPageEngine } from "./error-page/ErrorPageEngine";
import { LinkEngine } from "./link/LinkEngine";
import { MenuEngine } from "./menu/MenuEngine";
import { DragDropEngine } from "./drag-drop/DragDropEngine";
import { TableEngine } from "./table/TableEngine";
import { CardEngine } from "./card/CardEngine";
import { TabsEngine } from "./tabs/TabsEngine";
import { AccordionEngine } from "./accordion/AccordionEngine";
import { ModalEngine } from "./modal/ModalEngine";
import { AlertsEngine } from "./toast/AlertsEngine";
import { TooltipEngine } from "./tooltip/TooltipEngine";
import { DateTimeEngine } from "./date-time/DateTimeEngine";
import { FileUploadEngine } from "./file-upload/FileUploadEngine";
import { FileDownloadEngine } from "./file-download/FileDownloadEngine";
import { MediaEngine } from "./media/MediaEngine";
import { SliderEngine } from "./slider/SliderEngine";
import { CarouselEngine } from "./carousel/CarouselEngine";
import { ScrollAreaEngine } from "./scroll-area/ScrollAreaEngine";
import { DynamicDomEngine } from "./dynamic-dom/DynamicDomEngine";
import { WindowLabEngine } from "./window-lab/WindowLabEngine";
import { IframeLabEngine } from "./iframe-lab/IframeLabEngine";
import { ShadowDomEngine } from "./shadow-dom/ShadowDomEngine";
import { CookiePanelEngine } from "./cookie-panel/CookiePanelEngine";
import { StoragePanelEngine } from "./storage-panel/StoragePanelEngine";
import { PopupEngine } from "./popup/PopupEngine";
import { ApiPanelEngine } from "./api-panel/ApiPanelEngine";
import { MissionEngine } from "./mission/MissionEngine";
import { NightmareDomEngine } from "./nightmare-dom/NightmareDomEngine";

/**
 * Central lookup from ChallengeDefinition.component -> engine component.
 * Adding a new challenge NEVER requires new component code as long as an
 * engine component + variant already exists for its `component` key.
 */
export function EngineComponent({ challenge }: { challenge: ChallengeDefinition }) {
  switch (challenge.component) {
    case "action-surface":
      return <ActionSurface variant={challenge.variant} />;
    case "text-input":
      return <TextInputEngine variant={challenge.variant} />;
    case "dropdown":
      return <DropdownEngine variant={challenge.variant} />;
    case "button":
      return <ButtonEngine variant={challenge.variant} />;
    case "auth-panel":
      return <AuthPanelEngine variant={challenge.variant} />;
    case "error-page":
      return <ErrorPageEngine variant={challenge.variant} />;
    case "link":
      return <LinkEngine variant={challenge.variant} />;
    case "menu":
      return <MenuEngine variant={challenge.variant} />;
    case "drag-drop":
      return <DragDropEngine variant={challenge.variant} />;
    case "table":
      return <TableEngine variant={challenge.variant} />;
    case "card":
      return <CardEngine variant={challenge.variant} />;
    case "tabs":
      return <TabsEngine variant={challenge.variant} />;
    case "accordion":
      return <AccordionEngine variant={challenge.variant} />;
    case "modal":
      return <ModalEngine variant={challenge.variant} />;
    case "toast":
      return <AlertsEngine variant={challenge.variant} />;
    case "tooltip":
      return <TooltipEngine variant={challenge.variant} />;
    case "date-time":
      return <DateTimeEngine variant={challenge.variant} />;
    case "file-upload":
      return <FileUploadEngine variant={challenge.variant} />;
    case "file-download":
      return <FileDownloadEngine variant={challenge.variant} />;
    case "media":
      return <MediaEngine variant={challenge.variant} />;
    case "slider":
      return <SliderEngine variant={challenge.variant} />;
    case "carousel":
      return <CarouselEngine variant={challenge.variant} />;
    case "scroll-area":
      return <ScrollAreaEngine variant={challenge.variant} />;
    case "dynamic-dom":
      return <DynamicDomEngine variant={challenge.variant} />;
    case "window-lab":
      return <WindowLabEngine variant={challenge.variant} />;
    case "iframe-lab":
      return <IframeLabEngine variant={challenge.variant} />;
    case "shadow-dom":
      return <ShadowDomEngine variant={challenge.variant} />;
    case "cookie-panel":
      return <CookiePanelEngine variant={challenge.variant} />;
    case "storage-panel":
      return <StoragePanelEngine variant={challenge.variant} />;
    case "popup":
      return <PopupEngine variant={challenge.variant} />;
    case "api-panel":
      return <ApiPanelEngine variant={challenge.variant} />;
    case "mission":
      return <MissionEngine variant={challenge.variant} />;
    case "nightmare-dom":
      return <NightmareDomEngine variant={challenge.variant} />;
    default:
      return (
        <p className="text-sm text-slate-500">
          No engine component registered yet for "{challenge.component}" (see ARCHITECTURE.md roadmap).
        </p>
      );
  }
}
