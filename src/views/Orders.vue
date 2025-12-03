<script setup>

import { onMounted, computed,reactive, ref, onUnmounted } from 'vue';
import Sender from './Sender.vue';

const orderAccepted = ref(false)
const orders = ref([]);

const order = reactive({
    id: '',
    addressStartTrip: '',
    addressEndTrip: '',
    date: '',
    status: '',
    name_user: ''
})

const acceptOrder = async (order_selected) => {
    order.id = order_selected._id
    order.addressStartTrip = order_selected.route.addressStartTrip
    order.addressEndTrip = order_selected.route.addressEndTrip
    order.date = order_selected.date
    order.status = order_selected.status
    order.name_user = order_selected.user.firstName + ' ' + order_selected.user.lastName

    console.log("ACEITO " + order.id)

    await fetch(`http://3.151.215.80/api/viagens/${order_selected._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: "active"
      })
    })

    orderAccepted.value = true;
}

const clientSearch = ref('');

const filteredClients = computed(() => {
    if (!clientSearch.value) {
    return orders.value
  }

  const term = clientSearch.value.toLowerCase()

  return orders.value.filter(order =>

    (order.user.firstName.toLowerCase().includes(term) ||
    order.user.lastName.toLowerCase().includes(term)) 
  )

})

const getOrders = async () => {
    const response = await fetch(`http://3.151.215.80/api/viagens?status=pending`);

    const data = await response.json();

    console.log(data.length)

    orders.value = [...data];

    console.log(data)
}

let intervalId = null

onMounted (async () => {
    getOrders();

    intervalId = setInterval(getOrders, 5000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})

const cancel = () => {
    orderAccepted.value = false
}

// const teste = [
//     {
//         id: 1,
//         user: {
//             firstName: 'Matheus',
//             lastName: 'Araujo'
//         },
//         addressStartTrip: 'Rua Mário Domingos Testa 211, Campo Grande MS',
//         addressEndTrip: 'Rua Domingos Marques 1754, Campo Grande MS',
//         date: new Date()
//     },
//     {
//         id: 2,
//         user: {
//             firstName: 'Celso',
//             lastName: 'Araujo'
//         },
//         addressStartTrip: 'Rua Mário Domingos Testa 211, Campo Grande MS',
//         addressEndTrip: 'Rua Domingos Marques 1754, Campo Grande MS',
//         date: new Date()
//     },
//     {
//         id: 3,
//         user: {
//             firstName: 'Leo',
//             lastName: 'Araujo'
//         },
//         addressStartTrip: 'Rua Mário Domingos Testa 211, Campo Grande MS',
//         addressEndTrip: 'Rua Domingos Marques 1754, Campo Grande MS',
//         date: new Date()
//     },
//     {
//         id: 4,
//         user: {
//             firstName: 'Ana',
//             lastName: 'Santos'
//         },
//         addressStartTrip: 'Rua Mário Domingos Testa 211, Campo Grande MS',
//         addressEndTrip: 'Rua Domingos Marques 1754, Campo Grande MS',
//         date: new Date()
//     }
// ] 

  const fmt = new Intl.DateTimeFormat('pt-BR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  // hour12: false,
  timeZone: 'America/Sao_Paulo' // opcional, adicione se precisar forçar fuso
});

// orders.value = [...teste];

</script>
<template>
<Sender v-if="orderAccepted" @cancel="cancel" @getOrders="getOrders" :orderId="order.id" :adressStart="order.addressStartTrip" :adressEnd="order.addressEndTrip"</Sender>
<main v-else>
    <header>
        Pedidos a serem entregues
    </header>

    <section class="section_search">
            <input type="text" placeholder="Buscar por cliente" v-model="clientSearch"/>
    </section>
    
    <section class="section_orders">
        <div v-for="order in filteredClients" class="card_order">
          <span>#{{ order._id}}</span>
          <h2 class="name_client">{{ order.user.firstName + ' ' + order.user.lastName }}</h2>
          <div>
             <span><b>Gerado em:</b> {{ new Date(order.date).toLocaleDateString("pt-BR") }}</span>
          </div>
          <div>
            <span><b>Retirada:</b> {{ order.route.addressStartTrip }}</span>
          </div>
          <div>
            <span><b>Destino:</b> {{ order.route.addressEndTrip }}</span>
          </div>
          <div class="area_accept">
            <button class="accept_order" @click="acceptOrder(order)">Aceitar entrega</button>
          </div>
        </div>
    </section>
</main>

</template>

<style scoped>
    header {
        background-color: #000;
        height: 20vh;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        margin-bottom: 1rem;
        border-radius: 10px;
        font-weight: bold;
        text-align: center;
        /* padding: */
    }

    .section_search {
       background-color: #fff;
       height: 5vh;
       margin-bottom: 1rem; 
       display: flex;
       align-items: center;
       padding:1rem;
       border-radius: 10px;

    }

    input {
        width: 100%;
        border:none;
    }

    main {
        box-sizing: border-box;
        min-height: 100vh;
        padding: 2rem;
        background-color: #F5F7FA;
        font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    .area_accept {
        display: flex;
        justify-content: center;
    }

    .name_client {
      text-transform: capitalize;
    }

    .accept_order {
        padding: 0.8rem;
        border-radius: 10px;
        border:none;
        cursor:pointer;
    }

    .section_orders {
        display: flex;
        max-height: 60vh;
        flex-direction: column;
        overflow-y: auto;         /* ativa scroll vertical quando necessário */
        overflow-x: hidden;
        /* justify-content: space-evenly; */
        gap:1rem;

        /* padding: 1rem; */
    }

    .card_order {
        background-color: #fff;
        padding: 1rem;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        /* max-height: 14rem; */

    }

    h2 {
        color: #111827;
    }

    span {
        color: #6b7280;
    }


</style>