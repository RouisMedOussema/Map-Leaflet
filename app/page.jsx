"use client"

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import 'leaflet-draw/dist/leaflet.draw'
import './style.scss'
import 'bootstrap/dist/css/bootstrap.css'
import "leaflet/dist/images/marker-icon-2x.png"
import "leaflet/dist/images/marker-shadow.png"
import AddMarker from './add-marker'

export default function Home() {
  const mapRef = useRef(null)

  useEffect(() => {
    mapRef.current = L.map('map').setView([35.821430, 10.634422], 8)
    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current)

    var drawnItems = new L.FeatureGroup()
    mapRef.current.addLayer(drawnItems)
    var drawControl = new L.Control.Draw({
      draw: {
        circle: true,
        marker: false,
        circlemarker: false,
        polyline: false,
        rectangle: false,
        polygon: false
      },
    });
    mapRef.current.addControl(drawControl)

    //Draw Circle
    mapRef.current.on('draw:created', (e) => {
      var layer = e.layer
      console.log(layer, 'layer')
      drawnItems.addLayer(layer)

      if (layer instanceof L.Circle) {
        const radius = layer.getRadius()
        const bounds = layer.getBounds()
        const center = bounds.getCenter()
        const selectedMarkers = []

        mapRef.current.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            const markerId = layer.options.status
            const markerName = layer.options.name
            const markerLatLng = layer.getLatLng()
            const markerStatus = layer.options.status
            const distance = markerLatLng.distanceTo(center)
            if (distance <= radius && markerStatus == "Free") {
              selectedMarkers.push({ name: markerName, latLng: markerLatLng, status: markerStatus, id: markerId })
            }
          }
        })

        const clickCircle = () => {
          let popupContent = ''
          if (selectedMarkers.length > 0) {
            popupContent = selectedMarkers
              .map((marker) => `Id: <b>${marker.id}</>, Name: ${marker.name}, Status: <b>${marker.status}</b>, Latitude: ${marker.latLng.lat.toFixed(5)}, Longitude: ${marker.latLng.lng.toFixed(5)}`)
              .join('<br/>')
          } else {
            popupContent = "No markers found in the selected area."
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
      <AddMarker mapRef={mapRef} />
      <div id="map" />
    </div>
  )
}