<script setup>

import { ref } from 'vue';

const orders = ref([]);

const teste = [
    {
        id: 1,
        nome: 'Matheus',
        saida: 'Rua Mário Domingos Testa 211, Campo Grande MS',
        destino: 'Rua Domingos Marques 1754, Campo Grande MS',
        data_gerada: new Date()
    },
    {
        id: 2,
        nome: 'Matheus',
        saida: 'Rua Mário Domingos Testa 211, Campo Grande MS',
        destino: 'Rua Domingos Marques 1754, Campo Grande MS',
        data_gerada: new Date()
    },
    {
        id: 3,
        nome: 'Matheus',
        saída: 'Rua Mário Domingos Testa 211, Campo Grande MS',
        destino: 'Rua Domingos Marques 1754, Campo Grande MS',
        data_gerada: new Date()
    },
    {
        id: 4,
        nome: 'Matheus',
        saida: 'Rua Mário Domingos Testa 211, Campo Grande MS',
        destino: 'Rua Domingos Marques 1754, Campo Grande MS',
        data_gerada: new Date()
    }
] 

  const fmt = new Intl.DateTimeFormat('pt-BR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Sao_Paulo' // opcional, adicione se precisar forçar fuso
});

    orders.value = [...teste];
</script>

<template>
<main>
    <header>
        Pedidos a serem entregues
    </header>

    <section class="section_search">
            <input type="text" placeholder="Buscar por cliente"/>
    </section>
    
    <section class="section_orders">
        <div v-for="order in orders" class="card_order">
          <span>#{{ order.id }}</span>
          <h2>{{ order.nome }}</h2>
          <div>
            <span><b>Gerado em:</b> {{ fmt.format(order.data_gerada).replace(',','') }}</span>
          </div>
          <div>
            <span><b>Retirada:</b> {{ order.saida }}</span>
          </div>
          <div>
            <span><b>Destino:</b> {{ order.destino }}</span>
          </div>
        </div>
    </section>
</main>

</template>

<style scoped>
    header {
        background-color: #000;
        min-height: 20vh;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8rem;
        margin-bottom: 1rem;
        border-radius: 10px;
        font-weight: bold;
        /* padding: */
    }

    .section_search {
       background-color: #fff;
       margin-bottom: 1rem; 
       padding:1rem;
       border-radius: 10px;
    }

    input {
        width: 100%;
        border:none;
    }

    main {
        /* min-height: 100vh; */
        padding: 2rem;
        background-color: #F5F7FA;
        font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }

    .section_orders {
        display: flex;
        flex-direction: column;
        /* justify-content: space-evenly; */
        gap:1rem;
        /* background-color: red; */

        /* padding: 1rem; */
    }

    .card_order {
        background-color: #fff;
        padding: 1rem;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        cursor: pointer;
        /* max-height: 14rem; */

    }

    h2 {
        color: #111827;
    }

    span {
        color: #6b7280;
    }


</style>