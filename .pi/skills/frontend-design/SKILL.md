---
name: frontend-design
description: Guidance for distinctive, intentional frontend design when building, reshaping, or reviewing UI. Use for web components, pages, applications, and product surfaces where visual quality, interaction, and cohesion matter.
---

# Frontend Design

Approach this as the design lead at a small studio known for giving every client a visual identity that could not be mistaken for anyone else's. The goal is not to apply a house style. The goal is to make deliberate, opinionated choices about palette, typography, layout, motion, copy, and interaction that are specific to this product, audience, and task.

Do not make all projects look the same. Never reuse a familiar palette, type pairing, layout trope, gradient, card treatment, or decorative signature just because it worked before. If a visual choice could fit almost any SaaS dashboard, landing page, or mobile app, it is probably not specific enough.

## Ground it in the subject

If the brief does not pin down what the product or subject is, pin it yourself before designing: name one concrete subject, its audience, and the interface's single job, and state your choice. Use any available context about the human's preferences, existing product, brand, components, screenshots, design system, or prior direction as grounding material.

The subject's own world is where distinctive choices come from: its materials, tools, environment, vocabulary, constraints, rituals, pace, risk, and audience expectations. Build with the brief's real content and subject matter throughout.

When editing an existing app, inspect the running UI and source before changing it. Reuse existing tokens, components, layout patterns, accessibility conventions, and interaction behavior unless the user explicitly asks for a redesign. Do not invent a second design system inside a product that already has one.

## Choose a specific direction

Before coding, form a compact design plan:

- **Purpose**: what the interface helps the user do.
- **Audience**: who uses it and what they need to feel or understand.
- **Palette**: 4-6 named colors with roles, not a generic gradient grab bag.
- **Typography**: one characterful display choice when useful, one readable body choice, and a utility/data treatment if needed.
- **Layout**: the spatial idea, hierarchy, density, and responsive behavior.
- **Signature**: one memorable element that comes from the subject, not from decoration.

Then critique the plan before building. If any part reads like the default answer you would give for a similar prompt, revise it. Spend boldness in one place and keep the surrounding system disciplined.

## Design principles

For web designs, the hero is a thesis. Open with the most characteristic thing in the subject's world, in whatever form makes sense for it: a headline, image, animation, live demo, interaction, data moment, or task entry point. Be deliberate. A big number with a small label, supporting stats, and a gradient accent is only right when the subject actually calls for it.

Typography carries the personality of the page. Pair typefaces deliberately, set a clear type scale, and tune weights, widths, line-height, letter spacing, and wrapping. Make the type treatment a memorable part of the design when appropriate, not a neutral delivery vehicle for generic content.

Structure is information. Numbering, dividers, labels, cards, tabs, and section breaks should encode something true about the content. Do not add numbered markers unless order matters. Do not wrap every section in a card unless the information is truly made of independent objects.

Motion should serve the subject and task. One orchestrated page-load moment, state transition, or meaningful hover/focus interaction is usually stronger than scattered effects. Respect reduced motion. Sometimes removing animation is what makes the design feel less AI-generated.

Match complexity to the vision. Maximalist directions need deliberate depth and craft. Minimal directions need exact spacing, type, alignment, and restraint. Elegance comes from executing the chosen vision well.

## Build real interfaces

Implement production-quality UI, not static decoration. Primary navigation, calls to action, forms, filters, tabs, menus, toggles, selections, and visible states should work when they are part of the requested experience. Controls outside the core experience may stay visual-only if the user did not ask for full product behavior.

Use real assets and appropriate icon sources. Do not fake meaningful logos, images, product art, avatars, or icons with emoji, punctuation, placeholder boxes, CSS blobs, div art, text glyphs, or handmade SVG approximations. If an asset is unavailable, use the closest appropriate real replacement and keep the art direction consistent.

Avoid generic AI-generated aesthetics: predictable purple gradients, floating glass cards, arbitrary glow blobs, default Lucide icon rows, uniform rounded cards, meaningless 01/02/03 labels, and copy that sounds like a pitch deck. These are not banned when the brief truly demands them, but they must be justified by the product context.

## Write the interface carefully

Words are design material. Write from the user's side of the screen. Name things by what people control and recognize, not by how the system is built. Use active voice for controls: "Save changes," not "Submit." Keep vocabulary consistent across buttons, states, errors, empty screens, and confirmations.

Failure and emptiness should give direction. Errors should say what happened and how to fix it. Empty states should help the user take the next useful action. Keep the register conversational and tuned to the brand, with sentence case and no filler.

## Verify before handoff

Render the work in the browser before calling it done. Check the actual visible result, not just the code. Review at least:

- typography, wrapping, hierarchy, and text density
- spacing, alignment, layout rhythm, and responsive behavior
- colors, contrast, focus states, and reduced-motion behavior
- image and icon quality
- core interactions and UI states
- copy, empty states, and errors
- console/runtime errors when available

If the work is based on a screenshot, URL, Figma frame, mockup, or existing screen, compare the implementation against that source at the same viewport and state. Fix obvious mismatches before handoff. Do not claim fidelity from memory alone.
