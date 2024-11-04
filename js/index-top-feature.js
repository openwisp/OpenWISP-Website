const features = [
  {
    title: "Configuration Templates",
    href: "#templates-and-variables",
  },
  {
    title: "Automatic Provisioning",
    href: "https://openwisp.io/docs/dev/openwrt-config-agent/user/automatic-registration.html",
  },
  {
    title: "Automatic VPN Tunnels",
    href: "#automatic-vpn-tunnels",
  },
  {
    title: "Network Monitoring",
    href: "#network-monitoring",
  },
  {
    title: "Alerts & Notifications",
    href: "#notifications",
  },
  {
    title: "Multi-tenancy",
    href: "#multi-tenancy",
  },
  {
    title: "Firmware Upgrades",
    href: "#firmware-upgrades",
  },
  {
    title: "Network Topology",
    href: "#network-topology",
  },
  {
    title: "WiFi & Roaming",
    href: "#wifi-and-roaming",
  },
  {
    title: "Hotspots & Public WiFi",
    href: "#hotspot-and-public-wifi",
  },
  {
    title: "Mesh Networks",
    href: "#mesh-networks",
  },
  {
    title: "RADIUS & EAP",
    href: "#radius-eap",
  },
  {
    title: "IPAM",
    href: "#ipam",
  },
  {
    title: "Modular, Programmable, Extensible",
    href: "https://openwisp.io/docs/dev/general/values.html#software-reusability-for-long-term-sustainability",
  },
  {
    title: "Great Docs",
    href: "https://openwisp.io/docs/dev/",
  },
];

// Function to update the "Top Feature" section
function setRandomTopFeature() {
  // Select a random feature from the map
  const randomFeature = features[Math.floor(Math.random() * features.length)];

  // Update the Top Feature link with the selected feature's data
  const topFeatureTitle = document.getElementById("top-feature-title");
  topFeatureTitle.textContent = randomFeature.title;

  const topFeatureLink = document.getElementById("top-feature-link");
  if (randomFeature.href.startsWith("#")) {
    randomFeature.href = featuresBasePath + randomFeature.href;
  }
  topFeatureLink.href = randomFeature.href;
  topFeatureLink.style.display = "unset";
}

// Wait for the document to load before updating the Top Feature section
document.addEventListener("DOMContentLoaded", setRandomTopFeature);
