<script setup lang="ts">

</script>

<template>
<div class="main">
    <div class="menu">
        <div class="title">
            <img src="/logo.png" alt="spotlight logo" class="logo">
        </div>
        <button>Create</button>
        <button>Load</button>
        <button>Exit</button>
    </div>
</div>
</template>

<style lang="css" scoped>
.main {
    background-image: url("/background_smaller.jpg");
    width: 100vw;
    height: 100vh;
    background-size: cover;
}

.menu {
    display: flex;
    flex-direction: column;
    width: 15vw;
    height: auto;
    position: absolute;
    left: 5vw;
    top: 15vh
}

.logo {
    width: 15vw;
    height: auto;
}

button {
    background-color:rgb(240, 255, 255);
    opacity: 0.6;
    border-color: lightblue;
    font-weight: bold;
    font-size: larger;
    color: rgb(2, 58, 66);
    text-transform: uppercase;
    text-align: left;
    padding-left: 16px;
    padding-top: 9px;
    padding-bottom: 9px;
    height: 8vh;
    
}
</style>