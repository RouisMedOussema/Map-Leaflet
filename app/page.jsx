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
import AddTaxi from './add-taxi'

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
        const selectedTaxis = []

        mapRef.current.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            const taxiId = layer.options.randomId
            const taxiName = layer.options.name
            const taxiLatLng = layer.getLatLng()
            const taxiStatus = layer.options.status
            const distance = taxiLatLng.distanceTo(center)
            if (distance <= radius && taxiStatus == "Free") {
              selectedTaxis.push({ id: taxiId, name: taxiName, latLng: taxiLatLng, status: taxiStatus })
            }
          }
        })

        const clickCircle = (selectedTaxis) => {
          let popupContent = ''
          if (selectedTaxis.length > 0) {
            popupContent = selectedTaxis
              .map((taxi) => `Id: <b>${taxi.id}</b>, Name: <b>${taxi.name}</b>, Status: <b>${taxi.status}</b>, Latitude: ${taxi.latLng.lat.toFixed(5)}, Longitude: ${taxi.latLng.lng.toFixed(5)}`)
              .join('<br/>')
          } else {
            popupContent = "No taxis found in the selected area."
          }
          L.popup()
            .setLatLng(center)
            .setContent(popupContent)
            .openOn(mapRef.current)
        }
        layer.on('click', () => {
          clickCircle(selectedTaxis)
        })
        clickCircle(selectedTaxis)
      }
    });
  }, []);

  return (
    <div>
      <AddTaxi mapRef={mapRef} />
      <div id="map" />
    </div>
  )
}