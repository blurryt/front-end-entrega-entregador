<script setup>
import { ref, onMounted, onBeforeUnmount, onUnmounted } from 'vue'
import { loadGoogleMaps } from '../../composables/composableMaps'

const mapRef = ref(null)

const props = defineProps(['adressStart', 'adressEnd', 'orderId']);

const emit = defineEmits(['cancel', 'getOrders']);

const cancelOrder = async () => {
  console.log("CANCELANDO: " + props.orderId)

  await fetch(`http://3.151.215.80/api/viagens/${props.orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: "canceled"
      })
    })
  
  emit('cancel', false)
  emit('getOrders')
}

const completedOrder = async () => {
  await fetch(`http://3.151.215.80/api/viagens/${props.orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: "completed"
      })
    })

  emit('cancel', false)
  emit('getOrders')
}

let googleMapsNS, map
let userMarker = null
let watchId = null
let tracking = ref(false)
let directionsService = null
let directionsRenderer = null
let directionsRendererStart = null
let directionsRendererDelivery = null

let ignoreDirectionsCallbacks = false

let intervalId = null

// const destinationAddress = 'Parque das Nações Indígenas, Campo Grande - MS';
// const originAdress = 'Rua Domingos Marques 1751, Campo Grande MS ';

const checkOrder = async () => {
  try {
    const response = await fetch(`http://3.151.215.80/api/viagens/${props.orderId}`)
    const orderChecked = await response.json()

  console.log("verificado: " + orderChecked);

  if (orderChecked.status == 'active') {
  } else {
    alert('⚠️ Esta viagem foi cancelada!')
     clearInterval(intervalId)
     emit('cancel', false)
     emit('getOrders')
  }

  } catch (err) {
    console.error('Erro ao verificar atualizações', err)
  }
} 


const destinationAddress = props.adressEnd;
const originAdress = props.adressStart;

onMounted(async () => {
  const apiKey = 'AIzaSyCoQ58bNGXYgXOMKAlTjPjgrr6_4N2gyY0'
  googleMapsNS = await loadGoogleMaps(apiKey, ['places'])
  map = new googleMapsNS.Map(mapRef.value, {
    center: { lat: -20.4697, lng: -54.6201 },
    zoom: 14,
    mapTypeControl: false
  })

  directionsService = new googleMapsNS.DirectionsService()
  directionsRendererStart = new googleMapsNS.DirectionsRenderer({
    map,
    polylineOptions: { strokeColor: 'green' }
  })
  directionsRendererDelivery = new googleMapsNS.DirectionsRenderer({
    map,
    polylineOptions: { strokeColor: 'blue' }
  })

  // rota fixa B → C (endereço de saída → destino final)
  directionsService.route(
    { origin: originAdress, destination: destinationAddress, travelMode: googleMapsNS.TravelMode.DRIVING },
    (result, status) => {
      if (status === 'OK') {
        directionsRendererDelivery.setDirections(result)
      }
    }
  )

  // rota dinâmica A → B (posição atual → endereço de saída)
  startTracking()
  checkOrder();
  intervalId = setInterval(checkOrder, 5000) 
})

onUnmounted(() => {
  clearInterval(intervalId)
})

onBeforeUnmount(() => stopTracking())

function startTracking() {
  if (!navigator.geolocation) return alert('Geolocation não suportado')
  tracking.value = true
  ignoreDirectionsCallbacks = false

  // watchId = navigator.geolocation.watchPosition(async pos => {
  //   const lat = pos.coords.latitude
  //   const lng = pos.coords.longitude
  //   const latLng = { lat, lng }

  //   if (!userMarker) {
  //     userMarker = new googleMapsNS.Marker({ position: latLng, map, title: 'Você' })
  //     map.panTo(latLng)
  //   } else {
  //     userMarker.setPosition(latLng)
  //   }

  watchId = navigator.geolocation.watchPosition(pos => {
    const latLng = { lat: pos.coords.latitude, lng: pos.coords.longitude }

    if (!userMarker) {
      userMarker = new googleMapsNS.Marker({ position: latLng, map, title: 'Você' })
      map.panTo(latLng)
    } else {
      userMarker.setPosition(latLng)
    }



    // recalcula rota do ponto atual até o destino
    // directionsService.route(
    //   { origin: originAdress, destination: destinationAddress, travelMode: googleMapsNS.TravelMode.DRIVING },
    //   (result, status) => {
    //     if (ignoreDirectionsCallbacks) return // descarta respostas depois de stopTracking
    //     if (status === 'OK') {
    //       directionsRenderer.setDirections(result)
    //     } else {
    //       console.error('Erro ao recalcular rota:', status)
    //     }
    //   }
    // )

   directionsService.route(
      { origin: latLng, destination: originAdress, travelMode: googleMapsNS.TravelMode.DRIVING },
      (result, status) => {
        if (status === 'OK') {
          directionsRendererStart.setDirections(result)
        }
      }
    )


// rota 2: B → C
directionsService.route(
  { origin: originAdress, destination: destinationAddress, travelMode: googleMapsNS.TravelMode.DRIVING },
  (result, status) => {
    if (!ignoreDirectionsCallbacks && status === 'OK') {
      directionsRendererDelivery.setDirections(result)
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

<template>
  <div class="map-content">
    <div ref="mapRef" class="map-canvas"></div>

    <div class="controls">
      <!-- <button @click="startTracking" :disabled="tracking">Iniciar rastreio</button> -->
      <!-- <button @click="stopTracking" :disabled="!tracking">Parar rastreio</button> -->
    </div>
  </div>
  <div class="section_buttons">
    <button class="finish" @click="completedOrder">
      Finalizar Entrega
    </button>
    <button class="cancel" @click="cancelOrder">
      Cancelar Entrega
    </button>
  </div>
</template>

<style scoped>
.section_buttons {
  background-color: #000;
  display: flex;
  justify-content: center;
  gap: 10rem;
  align-items: center;
  height: 15vh ;
}

button {
  color:#fff;
  border: none;
  font-weight: bold;
  padding: 1rem;
  border-radius: 6px;
  cursor:pointer;
}

.cancel {
  background-color: #c1121f;
}

.finish {
  background-color: #1b4332;
}

.map-content { 
  width: 100vw;
  height: 85vh;
  position: relative; 
}
.map-canvas { 
  width: 100%;
   height: 100%; 
}
.controls { 
  position: absolute;
  top: 12px;
  right:12px;
  background: white;
  padding: 8px; 
  border-radius: 6px; }
</style>