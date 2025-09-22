GSoC 2025: Improving the netjsongraph.js Visualization Library
==============================================================

:date: 2025-09-22
:author: cestercian
:tags: gsoc, netjsongraph.js, visualization, new-features
:category: gsoc
:lang: en
:image_url: https://openwisp.org/images/default-preview.webp

.. image:: {static}/images/default-preview.webp
    :alt: Google Summer of Code, Improving netjsongraph.js Visualization Library
    :align: center

Project Overview
----------------

This project focused on enhancing ``netjsongraph.js``, a powerful JavaScript library for visualizing network topologies. The primary goal was to improve the library's functionality, user experience (UX), and resiliency, making it more robust and capable for complex, real-world applications like those in OpenWISP. The work involved implementing several key features, from preventing visual clutter on maps to adding new data visualization capabilities and hardening the library against invalid data.

Over the course of the GSoC program, all proposed objectives were successfully completed and merged into the main branch. The result is a more readable, functional, and resilient library that offers a significantly improved experience for both developers and end-users.

Summary of Contributions & Links to Work
----------------------------------------

I successfully implemented the following key features and fixes through a series of pull requests:

1.  **Feature: Prevent Overlapping of Clusters** — Developed a sophisticated algorithm to visually separate data clusters that share the same geographic location but belong to different categories, solving a major data visibility issue.

    - **Pull Requests:** `#396 [netjsongraph.js] <https://github.com/openwisp/netjsongraph.js/pull/396>`_, `#349 [netjsongraph.js] <https://github.com/openwisp/netjsongraph.js/pull/349>`_, `#668 [openwisp-monitoring] <https://github.com/openwisp/openwisp-monitoring/pull/668>`_

2.  **Feature: Display Connected Clients on Nodes** — Implemented a flexible, modular overlay to display the number of connected clients as dots orbiting each node, with a highly efficient placement algorithm.

    - **Pull Request:** `#411 [netjsongraph.js] <https://github.com/openwisp/netjsongraph.js/pull/411>`_

3.  **Feature: Zoom-Dependent Label Visibility** — Added options to show node labels only when the user zooms past a certain threshold, decluttering the view for both map and graph modes.

    - **Pull Requests:** `#407 [map] <https://github.com/openwisp/netjsongraph.js/pull/407>`_, `#419 [graph] <https://github.com/openwisp/netjsongraph.js/pull/419>`_

4.  **Fix: Resiliency for Invalid Data** — Hardened the library against data with duplicate node IDs. It now handles this issue gracefully by deduplicating nodes and logging a warning instead of crashing.

    - **Pull Request:** `#355 [netjsongraph.js] <https://github.com/openwisp/netjsongraph.js/pull/355>`_

5.  **Fix: Respect Map Tile Provider Zoom Levels** — Fixed the map's zoom behavior to honor the ``minZoom`` and ``maxZoom`` limits of the active tile provider, improving the user experience with visual cues on the zoom controls.

    - **Pull Request:** `#363 [netjsongraph.js] <https://github.com/openwisp/netjsongraph.js/pull/363>`_

Detailed Technical Breakdown of Work
------------------------------------

Core Achievement: Advanced Cluster Overlap Prevention
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This was the main goal of the project, designed to solve a critical issue where overlapping clusters would hide important information on the map.

- **The Problem:** When multiple nodes are located at the same geographic coordinates, the library groups them into a single cluster. However, if these nodes belonged to different categories (e.g., status "ok" vs. "critical"), the resulting clusters would be rendered directly on top of each other, making it impossible to see the status breakdown.

(Placeholder for Before/After GIF showing overlapping clusters vs. separated clusters)

- **The Mechanism & Logic:** I implemented a new multi-stage clustering algorithm and unified the data pipeline to support it.

1.  **Unifying GeoJSON and NetJSON:** A foundational step was to refactor the rendering pipeline to treat GeoJSON and NetJSON uniformly. I created a powerful ``geojsonToNetjson`` converter that transforms GeoJSON features into a standard internal ``{ nodes, links }`` structure. This allows advanced features like clustering to work seamlessly on both data formats.

    .. code-block:: javascript

       // file: src/js/netjsongraph.render.js (inside mapRender)
       if (self.utils.isGeoJSON(JSONData)) {
         // Preserve the original for rendering polygons, etc.
         self.originalGeoJSON = JSON.parse(JSON.stringify(JSONData));
         // Convert the working copy to NetJSON for the rest of the pipeline
         JSONData = self.utils.geojsonToNetjson(JSONData);
       }

    The converter intelligently handles node identity, flagging auto-generated IDs so they can be hidden from the UI.

    .. code-block:: javascript

       // file: src/js/netjsongraph.geojson.js (inside createNode)
       const providedId = baseProps.id || baseProps.node_id || null;
       const newId = providedId ? String(providedId) : `gjn_${nodes.length}`;
       const generatedIdentity = !providedId;
       const node = {
         id: newId,
         // ...
         _generatedIdentity: generatedIdentity, // internal marker
       };

2.  **Spatial Indexing and Grouping:** To efficiently find nearby nodes, the algorithm first builds a spatial index using **KDBush**. It then sub-divides these spatial groups based on the ``clusteringAttribute``.

3.  **Circular Separation Algorithm:** This is the core of the overlap prevention. If multiple sub-group clusters exist at one location, they are arranged in a circle.

    .. code-block:: javascript

       // file: src/js/netjsongraph.util.js (inside makeCluster)
       if (groupsCount > 1) {
         const angle = (2 * Math.PI * idx) / groupsCount;
         const basePoint = self.leaflet.latLngToContainerPoint([centroidLat, centroidLng]);
         // Offset in pixel space
         const offsetPoint = [
           basePoint.x + separationPx * Math.cos(angle),
           basePoint.y + separationPx * Math.sin(angle),
         ];
         // Convert back to lat/lng for display
         const offsetLatLng = self.leaflet.containerPointToLatLng(offsetPoint);
         centroidLng = offsetLatLng.lng;
         centroidLat = offsetLatLng.lat;
       }

4.  **Final Repulsion Pass:** To handle edge cases, a final, simple force-directed repulsion step treats all clusters and nearby single nodes as physical circles and gently pushes them apart if they overlap.

Feature: Displaying Connected Clients on Nodes
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- **The Problem:** The library lacked a built-in, flexible way to visualize secondary data points on nodes, such as the number of connected WiFi clients.

(Placeholder for GIF showing nodes with and without the client overlay)

- **The Mechanism & Logic:** I developed this feature as a modular overlay in ``src/js/netjsongraph.clients.js``.

- **Public API:** The feature is exposed via an easy-to-use ``attachClientsOverlay`` method.

    .. code-block:: javascript

       // file: public/example_templates/netjsongraph-wifi-clients.html
       const graph = new NetJSONGraph(data, {
         onReady() {
           // Attach reusable overlay plugin
           this.attachClientsOverlay({ radius: 5, gap: 3 });
         }
       });

- **Orbital Placement Algorithm:** To display clients, I implemented a spiral algorithm that places dots in expanding concentric rings. The number of dots per ring is calculated dynamically based on its circumference.

    .. code-block:: javascript

       // file: src/js/netjsongraph.clients.js (inside placeOrbit)
       for (let orbit = 0; i < total; orbit += 1) {
         const distance = Math.max(0.1, startDistance + orbit * 2 * radius * a);
         // Calculate how many dots fit on the current ring's circumference
         const n = Math.max(1, Math.floor((Math.PI * distance) / (a * radius)));
         const delta = total - i;

         for (let j = 0; j < Math.min(delta, n); j += 1, i += 1) {
           const angle = ((2 * Math.PI) / n) * j;
           const x = centerX + distance * Math.cos(angle);
           const y = centerY + distance * Math.sin(angle);
           overlay.add(new g.Circle(/* ... */));
         }
       }

- **GUI Integration:** The sidebar was enhanced to recursively render nested data, allowing it to display detailed information for each client (e.g., MAC address).

Feature: Zoom-Dependent Label Visibility
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- **The Problem:** In both map and graph views, displaying all node labels simultaneously at low zoom levels results in a cluttered and unreadable visualization.

(Placeholder for GIF showing labels appearing/disappearing on zoom)

- **The Mechanism & Logic:** I introduced ``showLabelsAtZoomLevel`` (for maps) and ``showGraphLabelsAtZoom`` (for graphs).

- **Map Mode:** The solution uses the Leaflet ``zoomend`` event to dynamically update the ECharts series.

    .. code-block:: javascript

       // file: src/js/netjsongraph.render.js
       self.leaflet.on("zoomend", () => {
         const currentZoom = self.leaflet.getZoom();
         const showLabel = currentZoom >= self.config.showLabelsAtZoomLevel;
         self.echarts.setOption({
           series: [{ id: "geo-map", label: { show: showLabel } }]
         });
       });

- **Graph Mode:** The solution uses the ECharts ``graphRoam`` event and a custom label ``formatter`` function.

    .. code-block:: javascript

       // file: src/js/netjsongraph.render.js (inside generateGraphOption)
       if (typeof self.config.showGraphLabelsAtZoom === "number") {
         const threshold = self.config.showGraphLabelsAtZoom;
         baseGraphLabel.formatter = (params) =>
           getGraphZoom() >= threshold ? params.data.name || "" : "";
       }

Resiliency and Robustness Fixes
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

- **Duplicate Node IDs:** I used a "defense-in-depth" strategy to prevent crashes from invalid data. The core logic is a new ``deduplicateNodesById`` utility.

    .. code-block:: javascript

       // file: src/js/netjsonWorker.js
       deduplicateNodesById(nodes) {
         const uniqueNodes = [];
         const nodeIds = new Set();
         nodes.forEach((node) => {
           if (node.id) {
             if (!nodeIds.has(node.id)) {
               nodeIds.add(node.id);
               uniqueNodes.push(node);
             } else {
               console.warn(`Duplicate node ID detected and skipped: ${node.id}`);
             }
           } else {
             uniqueNodes.push(node); // Keep nodes without IDs
           }
         });
         return uniqueNodes;
       }

- **Map Zoom Levels:** I corrected the map's behavior to respect tile provider limits and added CSS for visual feedback on the zoom controls.

    .. code-block:: css

       /* file: src/css/netjsongraph-theme.css */
       .leaflet-control-zoom-in.leaflet-disabled,
       .leaflet-control-zoom-out.leaflet-disabled {
         opacity: 0.7;
         cursor: default;
       }

Conclusion
----------

The Google Summer of Code program has been an incredibly rewarding experience. I successfully delivered all the required features, significantly enhancing the ``netjsongraph.js`` library's capabilities and user experience. The new clustering mechanism, in particular, is a major advancement that makes geographic network visualizations far more insightful. Through this project, I have deepened my skills in JavaScript, data visualization with ECharts and Leaflet, and robust software engineering practices like writing comprehensive tests and documentation. I am deeply grateful to my mentors and the entire OpenWISP community for their invaluable guidance and support throughout the summer.
