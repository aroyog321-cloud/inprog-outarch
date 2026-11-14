# OUTARCH CANVAS
## Master Product, Architecture, Implementation & Quality Specification

**Project:** OUTARCH  
**Feature:** Infinite Development Canvas  
**Repository:** `D:\Downloads\Mission-Control-2.19.0-Full-App-UI-Redesign`  
**Document purpose:** One authoritative reference for the complete Canvas vision, technical decisions, requirements, limitations, quality standards, and continuous implementation tracking.

---

# 1. THE VISION

OUTARCH Canvas is intended to become a powerful, infinite, interactive development workspace.

It should allow users to arrange their development environment spatially rather than being restricted to conventional tabs, panels, or fixed layouts.

Users should be able to place terminals, browser surfaces, editors, drawings, PDFs, images, notes, and other integrated tools anywhere on an infinite workspace.

The Canvas must feel like a natural part of OUTARCH, not a separate application or an ordinary whiteboard.

The goal is a unified environment where users can:
- Develop software.
- Run multiple terminals.
- Browse documentation and websites.
- Write and edit code.
- Draw architecture diagrams.
- Store notes and references.
- Organize files and resources.
- Connect relevant information through shared context.
- Arrange everything according to their own workflow.
- Save and restore their entire working environment.

The experience should combine the freedom of an infinite whiteboard with the practical capabilities of a developer desktop.

## Core principle

The Canvas is not merely a surface containing movable rectangles.

It is a persistent, interactive development environment with real tools, real functionality, carefully managed state, and meaningful integration with OUTARCH.

---

# 2. DECISIONS ALREADY MADE

These decisions should be treated as established project requirements.

## 2.1 External Windows application embedding is excluded

We are deliberately keeping real external Windows application integration aside.

Do not implement:
- Arbitrary external Windows application embedding.
- HWND hosting.
- VS Code window embedding.
- Notepad++ window embedding.
- Synchronization of arbitrary external application windows.
- External application lifecycle management inside Canvas.

This is deferred to a future update.

However, the Canvas architecture should be extensible enough to support external application objects later without requiring a complete rewrite.

## 2.2 Integrated tools are included

The Canvas should still contain functional integrated tools:

- OUTARCH terminals.
- Integrated browser.
- Notepad and code editor.
- Drawing and whiteboard.
- Image viewer.
- PDF viewer.
- File previews.
- Notes and annotations.
- Shared context capabilities.

## 2.3 Do not compromise existing OUTARCH architecture

The existing application already has important functionality.

The Canvas must integrate with the existing architecture instead of replacing it.

In particular:
- Do not replace the existing terminal engine.
- Do not transfer process ownership to the frontend.
- Do not break PTY attachment and detachment.
- Do not unnecessarily modify existing application navigation.
- Do not break existing project and workspace functionality.
- Do not modify Supabase schemas or backend functionality without explicit approval.

## 2.4 Complete feature, not a reduced prototype

The intended deliverable is the complete cohesive Canvas experience.

Internal implementation can be organized in whatever order is technically safest, but the end result must not be a collection of disconnected demonstrations or permanently incomplete features.

Every requirement must have an implementation status, verification status, and outstanding-work record.

---

# 3. COMPLETE CANVAS FEATURE REQUIREMENTS

## 3.1 Infinite workspace

The Canvas must provide:
- Infinite horizontal and vertical workspace.
- Smooth panning.
- Smooth zooming.
- Mouse-wheel interaction.
- Zoom around cursor position.
- Fit-to-content.
- Reset zoom.
- Center workspace.
- Grid and optional grid visibility.
- Optional snap-to-grid.
- Coordinate-aware positioning.
- Multiple objects at different positions.
- Large workspaces without severe performance degradation.

Objects should remain positioned correctly when the user zooms, pans, resizes the application window, or restores a workspace.

## 3.2 Object management

All Canvas objects should support appropriate lifecycle operations.

Requirements:
- Create.
- Select.
- Move.
- Resize.
- Focus.
- Minimize.
- Maximize.
- Restore.
- Close.
- Duplicate.
- Rename.
- Delete.
- Bring forward.
- Send backward.
- Multi-select.
- Group.
- Ungroup.
- Lock position.
- Alignment.
- Distribution.
- Context menus.

The system should support different object types without creating separate, incompatible implementations for each.

## 3.3 Terminal objects

This is one of the most important integrations.

Use the existing OUTARCH terminal and engine architecture.

Requirements:
- Multiple real terminal surfaces.
- Real PTY input and output.
- Existing shell support.
- Persistent running processes while objects move.
- Correct terminal focus.
- Correct keyboard input routing.
- Terminal scrolling independent of Canvas scrolling.
- Resize synchronization with PTY dimensions.
- Attach and detach.
- Existing terminal lifecycle handling.
- Appropriate exit and error states.

Moving a terminal must never restart its process.

Resizing a terminal must update its PTY dimensions without recreating the session.

The UI must not own terminal processes.

The Canvas must not bypass EngineAPI or access private session-engine internals.

## 3.4 Integrated browser

Provide actual browser functionality rather than a decorative browser mockup.

Requirements:
- URL input.
- Navigation.
- Back and forward.
- Reload.
- Loading indication.
- Browser surface.
- Multiple browser objects.
- Proper focus handling.
- Browser resizing.
- Mouse and keyboard interaction.
- Appropriate browser session isolation.
- Error and navigation states.

Evaluate the existing desktop framework before selecting a browser technology.

WebView2 is a candidate for Windows, but its compatibility with the current framework must be established before implementation.

Do not recreate the browser when an object is moved or resized.

## 3.5 Notepad and code editor

Requirements:
- Multiple documents.
- Tabs.
- Markdown support.
- Plain-text editing.
- Code editing.
- Syntax highlighting.
- Search and replace.
- Autosave.
- Manual save.
- File opening.
- File saving.
- Unsaved-change indication.
- Appropriate recovery after unexpected shutdown.
- Keyboard shortcuts.
- Clipboard support.

The editor must be a real editing environment, not a static note panel.

## 3.6 Drawing and whiteboard

Evaluate Excalidraw as a drawing engine.

Desired capabilities:
- Freehand drawing.
- Shapes.
- Arrows.
- Connectors.
- Text.
- Images.
- Selection.
- Movement.
- Resizing.
- Undo.
- Redo.
- Export.
- Import.
- Persistent drawings.

Excalidraw should not be treated as the entire OUTARCH Canvas.

The OUTARCH Canvas must own the workspace, object management, persistence integration, and interaction between different tools.

Evaluate the official package and its licensing, dependencies, compatibility, and maintenance requirements.

Do not blindly copy its complete source repository into OUTARCH.

## 3.7 Image, PDF and file objects

Requirements:
- Image previews.
- PDF viewing.
- File previews.
- Drag-and-drop from Windows Explorer.
- Object movement.
- Object resizing.
- Appropriate zooming.
- File references.
- Optional managed copies where necessary.
- Clear missing-file handling.

Do not silently lose references when a source file is moved or deleted.

## 3.8 Shared context

Canvas objects should be capable of sharing relevant information.

Support:
- Isolated context.
- Project-shared context.
- Selective context sharing.
- Workspace-shared context.

For example, a terminal, editor, and browser may use selected project information when explicitly permitted.

Important distinctions:
- Shared context is not the same as shared shell state.
- Sharing project information must not automatically expose all files.
- Browser authentication should not automatically be shared.
- Terminal processes and working directories remain independently managed.
- Context permissions must be explicit and understandable.

---

# 4. UI/UX REQUIREMENTS

Preserving the existing OUTARCH identity is critical.

The Canvas must look and feel like it belongs to OUTARCH.

## 4.1 Visual direction

Target:
- Premium dark developer environment.
- Technical minimalism.
- Clean typography.
- Carefully controlled spacing.
- High information density.
- Subtle borders.
- Restrained animations.
- Strong focus states.
- Consistent interaction feedback.

Avoid:
- Generic SaaS dashboard design.
- Excessive rounded cards.
- Unnecessary gradients.
- Glassmorphism everywhere.
- Excessive shadows.
- Decorative elements that waste workspace.
- Unnecessary empty panels.
- Inconsistent component styles.

## 4.2 Existing UI preservation

Before modifying existing components:
- Identify the existing design system.
- Identify typography and spacing rules.
- Identify existing colors and tokens.
- Identify shared components.
- Identify existing navigation and layout.
- Identify animation conventions.
- Identify current responsive behavior.

Do not redesign unrelated application screens.

Do not replace existing components without understanding their dependencies.

Any Canvas-specific UI improvements should be consistent with the broader OUTARCH application.

## 4.3 UX improvements worth considering

The following improvements may make the experience significantly better:

- A compact Canvas toolbar.
- A searchable object-creation menu.
- Quick-add shortcuts.
- A workspace minimap.
- Zoom percentage display.
- A focus mode.
- A contextual object toolbar.
- Clear selection outlines.
- Smart alignment guides.
- A quick switcher.
- Recent workspace restoration.
- Helpful empty states.
- Clear saving indicators.
- Keyboard shortcut discoverability.

These should be implemented only when they genuinely improve usability.

## 4.4 Interaction quality

The following interactions must be tested carefully:

- Typing in terminals.
- Selecting terminal text.
- Scrolling terminal output.
- Typing in browser fields.
- Browser scrolling.
- Editor keyboard shortcuts.
- Drawing with mouse and touch-compatible input where supported.
- Dragging objects.
- Resizing objects.
- Canvas panning.
- Zooming.
- Multi-selection.
- Context menus.
- Clipboard interactions.

Never allow ordinary Canvas interactions to steal input from an active terminal, editor, or browser.

---

# 5. TECHNICAL LIMITATIONS AND SOLUTIONS

A professional implementation must acknowledge limitations instead of pretending they do not exist.

## 5.1 Embedded native/web surface composition

Potential problem:
Browser surfaces and terminal rendering may have different composition, focus, stacking, and input behaviors from ordinary frontend elements.

Solution:
- Inspect the existing desktop framework.
- Determine its native composition capabilities.
- Test browser and terminal surfaces early.
- Define a consistent Canvas object boundary.
- Avoid assumptions that all objects behave like ordinary HTML elements.
- Test z-order and resizing on the actual Windows application.

## 5.2 Terminal lifecycle

Potential problem:
Moving, resizing, or recreating terminal UI components can accidentally interrupt sessions.

Solution:
- Keep PTY ownership in the engine.
- Separate terminal session identity from Canvas object identity.
- Preserve the same session when the object moves.
- Resize the existing PTY instead of creating another.
- Test unmount, remount, attach, detach, and application shutdown behavior.

## 5.3 Input and event conflicts

Potential problem:
The same mouse or keyboard input may be interpreted by both the Canvas and the embedded object.

Solution:
Establish explicit interaction ownership.

Examples:
- Titlebar drag moves an object.
- Resize handles resize an object.
- Terminal content receives terminal input.
- Browser content receives browser input.
- Canvas background receives pan input.
- Drawing mode captures drawing gestures.
- Active editors receive editing shortcuts.

Do not rely on broad event propagation hacks.

## 5.4 Performance

Potential problem:
A large Canvas with many terminals, browsers, images, and drawing objects may consume excessive CPU and memory.

Solution:
- Separate world coordinates from screen coordinates.
- Avoid unnecessary full-workspace rerenders.
- Batch geometry updates.
- Virtualize lightweight objects where appropriate.
- Consider visibility-aware resource management.
- Avoid destroying live terminal sessions merely because they are offscreen.
- Avoid recreating WebView instances during ordinary movement.
- Profile actual memory and CPU usage.
- Test large workspaces with realistic object counts.

## 5.5 Browser integration

Potential problem:
Native browser integration may have framework-specific constraints around focus, overlays, resizing, and stacking.

Solution:
- Investigate the current framework first.
- Evaluate WebView2 compatibility.
- Prototype the difficult interactions in the actual desktop shell.
- Document known limitations.
- Use the least disruptive compatible integration.

## 5.6 Drawing integration

Potential problem:
Excalidraw may bring its own UI, state, styles, dependencies, and persistence assumptions.

Solution:
- Evaluate package-level integration.
- Keep the drawing engine separate from Canvas object management.
- Preserve licensing and attribution.
- Define a controlled boundary between drawing state and workspace state.
- Avoid unnecessary source forks.

## 5.7 Persistence and recovery

Potential problem:
Workspace layouts and object states can become corrupted or inconsistent after crashes or incomplete writes.

Solution:
- Use versioned persistence formats.
- Validate stored data before restoration.
- Use safe, atomic persistence where supported.
- Maintain recovery behavior.
- Handle missing files and unsupported object versions.
- Never silently overwrite valid workspace data.

## 5.8 Backend dependency

Potential problem:
Adding Canvas functionality could introduce unnecessary Supabase or backend changes.

Solution:
- Prefer local-first persistence where appropriate.
- Keep Canvas storage independent from unrelated existing application data.
- Do not change Supabase schemas without approval.
- Avoid introducing a backend requirement for functionality that can work locally.

## 5.9 External Windows applications

This limitation is intentional, not a problem to solve in this version.

Arbitrary external Windows application embedding is deferred.

Do not spend implementation effort attempting to bypass this decision.

Keep the architecture extensible for a future update.

---

# 6. ARCHITECTURAL REQUIREMENTS

The Canvas should have a consistent object model.

Potential object categories:
- Terminal object.
- Browser object.
- Editor object.
- Drawing object.
- Image object.
- PDF object.
- File object.
- Note object.
- Future external application object.

Each object should have a well-defined lifecycle:
- Create.
- Initialize.
- Render.
- Focus.
- Move.
- Resize.
- Minimize.
- Restore.
- Persist.
- Restore from persistence.
- Cleanup.

The Canvas should control presentation and workspace organization.

Existing application services should continue owning their respective responsibilities.

For example:
- The engine owns terminal processes.
- The browser integration owns browser sessions.
- The editor owns document editing state.
- The drawing engine owns drawing interactions.
- The Canvas manages placement, selection, arrangement, and workspace persistence.

Avoid one giant Canvas component that handles every object type and every interaction.

Avoid unnecessary abstractions as well. Architecture should be maintainable and justified by actual requirements.

---

# 7. PERSISTENCE AND DATA SAFETY

The Canvas must persist its workspace.

Store the appropriate information:
- Workspace identity.
- Object type.
- Object identity.
- Position.
- Dimensions.
- Z-order.
- Object configuration.
- Groups.
- Drawing data.
- Notes.
- Annotations.
- Relevant object state.
- Workspace version.

Distinguish:
1. Canvas layout state.
2. Tool-specific state.
3. Running process state.
4. External file references.

Do not assume that restoring a Canvas requires automatically restarting every previous process.

Restoration behavior must be intentional and safe.

Preserve compatibility with existing application data.

---

# 8. TESTING AND BUG PREVENTION

The goal is to achieve the highest practical level of reliability.

No honest development process can guarantee that software will have absolutely zero bugs. The requirement is to prevent avoidable bugs, detect problems quickly, repair them correctly, and ensure they do not return.

## 8.1 Required verification

Test:
- Application startup.
- Canvas opening and closing.
- Workspace creation.
- Workspace saving.
- Workspace restoration.
- Object creation.
- Object deletion.
- Movement.
- Resizing.
- Multi-selection.
- Grouping.
- Z-order.
- Pan and zoom.
- Terminal input and output.
- Terminal process continuity.
- Terminal resizing.
- Browser navigation.
- Browser input.
- Editor functionality.
- Drawing.
- Drawing persistence.
- PDF viewing.
- Image viewing.
- File drag-and-drop.
- Shared context permissions.
- Keyboard shortcuts.
- Mouse interaction.
- Error recovery.
- Application shutdown.

## 8.2 Regression testing

Existing OUTARCH functionality must remain functional.

Test affected existing areas after changes.

Do not assume that a successful Canvas test means the rest of the application still works.

## 8.3 Error handling

Every meaningful failure should have:
- Reproducible steps.
- A recorded error.
- Root-cause investigation.
- A real fix.
- Verification.
- Regression coverage where appropriate.

Do not hide errors with empty catch blocks or silent fallbacks.

Do not claim that an issue is fixed without verification.

---

# 9. CONTINUOUS IMPLEMENTATION TRACKING

Maintain a living implementation checklist.

Every requirement must have one of these statuses:

- NOT STARTED
- IN PROGRESS
- IMPLEMENTED
- TESTING
- VERIFIED

Every blocked requirement must explain:
- Why it is blocked.
- What technical limitation exists.
- What alternatives were evaluated.
- What the recommended solution is.
- What decision or dependency is required.

## Continuous review rule

After every meaningful implementation change:

1. Review the original requirement.
2. Identify what was completed.
3. Identify what remains.
4. Check for regressions.
5. Check for new bugs.
6. Update the tracking document.
7. Update the bug log.
8. Identify the next highest-priority unresolved requirement.

Never mark an entire feature complete because its UI exists.

A feature is complete only when its actual functionality, integration, persistence, error handling, and relevant tests have been verified.

---

# 10. BUG AND ERROR LOG

Maintain a separate persistent file named:

`CANVAS_BUG_LOG.md`

Every discovered issue must be recorded.

Use this format:

## Issue ID: CANVAS-XXX

**Date discovered:**

**Feature:**

**Severity:** Critical / High / Medium / Low

**Status:** Open / Investigating / Fixed / Verified

**Description:**

**Steps to reproduce:**

**Expected behavior:**

**Actual behavior:**

**Root cause:**

**Files or components affected:**

**Fix implemented:**

**Verification performed:**

**Regression test added:**

**Prevention for future changes:**

---

## Bug log rules

- Never delete an issue merely because it was fixed.
- Preserve the original cause and resolution.
- Record recurring problems.
- Record incomplete fixes.
- Reopen issues when regressions occur.
- Link related issues where useful.
- Verify fixes in the actual application.
- Distinguish between a workaround and a permanent solution.

Also maintain a short summary of:
- Open critical issues.
- Open high-priority issues.
- Recently fixed issues.
- Recurring issues.
- Known limitations.

---

# 11. REQUIRED PROJECT DOCUMENTATION

Keep these project records synchronized:

**OUTARCH_CANVAS_MASTER_SPEC.md**
- Overall vision.
- Product decisions.
- Feature requirements.
- Architecture.
- Limitations.
- UI/UX requirements.
- Quality standards.

**CANVAS_IMPLEMENTATION_TRACKER.md**
- Every requirement.
- Implementation status.
- Testing status.
- Remaining work.
- Blockers.
- Next actions.

**CANVAS_BUG_LOG.md**
- All discovered bugs.
- Root causes.
- Fixes.
- Verification.
- Regression prevention.

**CANVAS_ARCHITECTURE.md**
- Actual architecture.
- Object lifecycle.
- Integration boundaries.
- Persistence model.
- Rendering and event handling.
- Important technical decisions.

Documentation must describe the actual implementation, not an imagined implementation.

Update documentation when architectural decisions or behavior change.

---

# 12. FINAL ACCEPTANCE CRITERIA

The Canvas should not be considered complete until all applicable requirements below have been verified.

## Core workspace
- Infinite workspace.
- Smooth pan and zoom.
- Persistent layout.
- Reliable object movement and resizing.
- Multi-selection and grouping.
- Correct focus and z-order.

## Integrated tools
- Fully functional terminal objects.
- Functional integrated browser.
- Functional Notepad/editor.
- Drawing and whiteboard.
- Image viewer.
- PDF viewer.
- File objects.

## Integration
- Existing PTY architecture preserved.
- No accidental terminal process recreation.
- Correct resize behavior.
- Correct keyboard and mouse routing.
- Shared context permissions respected.
- Existing OUTARCH functionality preserved.

## Quality
- No known unresolved critical bugs.
- No known unresolved high-severity bugs at release.
- Relevant tests passing.
- Type checking passing where available.
- Linting passing where available.
- Production build successful.
- Actual Windows application tested.
- Workspace recovery tested.
- Regression tests passing.

## Documentation
- Master specification updated.
- Implementation tracker updated.
- Bug log updated.
- Architecture documentation updated.
- Known limitations documented.

---

# 13. FINAL PRODUCT STANDARD

The goal is not simply to make Canvas work.

The goal is to make it feel like one of the strongest parts of OUTARCH.

It should be:
- Reliable.
- Fast.
- Predictable.
- Visually consistent.
- Intuitive.
- Extensible.
- Maintainable.
- Integrated with existing OUTARCH functionality.

Do not sacrifice reliability for visual effects.

Do not sacrifice the existing application for new features.

Do not leave partially implemented functionality hidden behind attractive UI.

Do not mark unfinished functionality as complete.

Every requirement should be tracked, implemented, tested, and verified.

**The finished result should be a cohesive, professional infinite development workspace that makes OUTARCH significantly more powerful without compromising the application that already exists.**
