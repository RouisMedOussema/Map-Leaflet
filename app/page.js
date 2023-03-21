"use client"

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw/dist/leaflet.draw';
import './style.scss';
import 'bootstrap/dist/css/bootstrap.css'
import "leaflet/dist/images/marker-icon-2x.png";
import "leaflet/dist/images/marker-shadow.png";

export default function Home() {
  const [circle, setCircle] = useState(null)
  const [markerCount, setMarkerCount] = useState(0)
  const mapRef = useRef(null)

  const handleAddMarker = () => {

    // random latitude and longitude
    const bounds = mapRef.current.getBounds()
    const lat = Math.random() * (bounds.getNorth() - bounds.getSouth()) + bounds.getSouth()
    const lng = Math.random() * (bounds.getEast() - bounds.getWest()) + bounds.getWest()

    const marker = L.marker([lat, lng], { name: String.fromCharCode(65 + markerCount) })

    // Save the circle in state and open a popup
    setCircle(marker)
    marker.addTo(mapRef.current)
    marker.bindPopup(`Name: ${String.fromCharCode(65 + markerCount)}, Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}`).openPopup()
    setMarkerCount((markerCount + 1) % 26)
  }
  useEffect(() => {
    mapRef.current = L.map('map').setView([35.821430, 10.634422], 8)
    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current)

    var drawnItems = new L.FeatureGroup();
    mapRef.current.addLayer(drawnItems);
    var drawControl = new L.Control.Draw({
      draw: {
        circle: true,
        circlemarker: false,
        marker: false,
        polyline: false,
        rectangle: false,
        polygon: false
      },
    });
    mapRef.current.addControl(drawControl);

    //Draw Circle
    mapRef.current.on('draw:created', function (e) {
      var layer = e.layer;
      drawnItems.addLayer(layer);

      if (layer instanceof L.Circle) {
        const radius = layer.getRadius();
        const bounds = layer.getBounds()
        const center = bounds.getCenter();
        const selectedMarkers = [];

        mapRef.current.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            const markerName = layer.options.name;
            const markerLatLng = layer.getLatLng()
            const distance = markerLatLng.distanceTo(center);

            if (distance <= radius) {
              selectedMarkers.push({ name: markerName, latLng: markerLatLng });
            }
          }
        })

        const clickCircle = () => {
          let popupContent = ''
          if (selectedMarkers.length > 0) {
            popupContent = selectedMarkers
              .map((marker) => `Name: ${marker.name}, Latitude: ${marker.latLng.lat.toFixed(5)}, Longitude: ${marker.latLng.lng.toFixed(5)}`)
              .join('<br/>')
          } else {
            popupContent = "No markers found in the selected area.";
          }
          L.popup()
            .setLatLng(center)
            .setContent(popupContent)
            .openOn(mapRef.current)
        }
        layer.on('click', () => {
          clickCircle(selectedMarkers)
        })
        clickCircle(selectedMarkers)
      }
    });
  }, []);

  return (
    <div>
      <button className='btn btn-info overlay-button-container' onClick={handleAddMarker}>Add Marker</button>
      <div id="map" />
    </div>
  )
}