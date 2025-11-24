<template>
  <div class="map-content">
    <div ref="mapRef" class="map-canvas"></div>

    <div class="controls">
      <button @click="startTracking" :disabled="tracking">Iniciar rastreio</button>
      <button @click="stopTracking" :disabled="!tracking">Parar rastreio</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { loadGoogleMaps } from '../../composables/composableMaps'

const mapRef = ref(null)
let googleMapsNS, map
let userMarker = null
let watchId = null
let tracking = ref(false)
let directionsService = null
let directionsRenderer = null
let ignoreDirectionsCallbacks = false // fl

const destinationAddress = 'Parque das Nações Indígenas, Campo Grande - MS'

onMounted(async () => {
  const apiKey = 'AIzaSyCoQ58bNGXYgXOMKAlTjPjgrr6_4N2gyY0'
  googleMapsNS = await loadGoogleMaps(apiKey, ['places'])
  map = new googleMapsNS.Map(mapRef.value, { center: { lat: -20.4697, lng: -54.6201 }, zoom: 14 })
  directionsService = new googleMapsNS.DirectionsService()
  directionsRenderer = new googleMapsNS.DirectionsRenderer({ map, suppressMarkers: false })
})

onBeforeUnmount(() => stopTracking())

function startTracking() {
  if (!navigator.geolocation) return alert('Geolocation não suportado')
  tracking.value = true
  ignoreDirectionsCallbacks = false

  watchId = navigator.geolocation.watchPosition(async pos => {
    const lat = pos.coords.latitude
    const lng = pos.coords.longitude
    const latLng = { lat, lng }

    if (!userMarker) {
      userMarker = new googleMapsNS.Marker({ position: latLng, map, title: 'Você' })
      map.panTo(latLng)
    } else {
      userMarker.setPosition(latLng)
    }

    // recalcula rota do ponto atual até o destino
    directionsService.route(
      { origin: latLng, destination: destinationAddress, travelMode: googleMapsNS.TravelMode.DRIVING },
      (result, status) => {
        if (ignoreDirectionsCallbacks) return // descarta respostas depois de stopTracking
        if (status === 'OK') {
          directionsRenderer.setDirections(result)
        } else {
          console.error('Erro ao recalcular rota:', status)
        }
      }
    )
  }, err => {
    console.error('Erro geolocation', err)
  }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 })
}


function stopTracking() {
  // 1) para o watch do geolocation
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
    watchId = null
  }

  // 2) sinaliza para ignorar callbacks futuros do DirectionsService
  ignoreDirectionsCallbacks = true
  tracking.value = false

  // 3) remove rota desenhada do mapa
  if (directionsRenderer) {
    // Opção A: remove apenas as direções mantendo o renderer ativo
    directionsRenderer.setDirections({ routes: [] })

    // Ou Opção B: remove renderer completamente do mapa
    // directionsRenderer.setMap(null)
  }

  // 4) remove marcador do usuário (se existir)
  if (userMarker) {
    userMarker.setMap(null)
    userMarker = null
  }
}

</script>

<style scoped>
.map-content { width: 100vw; height: 80vh; position: relative; }
.map-canvas { width: 100%; height: 100%; }
.controls { position: absolute; top: 12px; right: 12px; background: white; padding: 8px; border-radius: 6px; }
</style>