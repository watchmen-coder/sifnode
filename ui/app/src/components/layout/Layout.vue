<template>
  <div class="layout">
    <Panel dark>
      <template v-slot:header v-if="header">
        <PanelNav />
      </template>
      <div class="header" v-if="backLink || title">
        <div v-if="backLink">
          <router-link class="back-link" :to="backLink"
            ><Icon icon="back"
          /></router-link>
        </div>
        <div v-if="emitBack">
          <span @click="$emit('back')" class="back-link"
            ><Icon icon="back"
          /></span>
        </div>
        <div class="title">
          {{ title }}
        </div>
      </div>
      <slot></slot>
    </Panel>
    <Panel v-if="!!$slots.after" class="after">
      <slot name="after"></slot>
    </Panel>
    <Panel class="secondary">
      <div class="secondary-conteainer header dark">
        Notifications
      </div>
      <div class="secondary-container">
        Sif Network Dispatch: 
                <ul>
          <li>
        - <a href="">Network congestion due to high volume. Expect high gas for the next 12 hours ></a>

        </li>
        <li>
        - <a href="">Network updated! See 1.23.1 release notes ></a>
        </li>
                <li>
        - <span>Rowan reaches all-time high. $14!</span>
        </li>
        <li style="text-align: center">
          <span style="color: #8cc63f; margin-left: 140px"> [ CHART ] </span>
          </li>
          </ul>
      </div>
      <div class="secondary-container grey">
        <span class="header">Balances</span>
        <hr />
        <ul>
          <li><span>Connected ETH Wallet:</span>
          <a href="">0xc3b265.........E305b000e7D</a><span style="margin-left: 8px"><!--v-if--><!--v-if--><!--v-if--><!--v-if--><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><g id="Gruppe_1223" data-name="Gruppe 1223" transform="translate(0.246 0.131)"><circle id="Ellipse_29" data-name="Ellipse 29" cx="6" cy="6" r="6" transform="translate(-0.246 -0.131)" fill="#8cc63f"></circle><path id="Pfad_1915" data-name="Pfad 1915" d="M1253.022,450.614l1.955,1.955,3.678-3.678" transform="translate(-1249.998 -444.861)" fill="none" stroke="#fff" stroke-linecap="round" stroke-miterlimit="10" stroke-width="1.5"></path></g></svg><!--v-if--><!--v-if--><!--v-if--><!--v-if--><!--v-if--></span></li>
          <!-- <hr> -->
          <li>
            <span>ETH</span>
            <a href="">33.344</a>
          </li>
          <li>
            <span>USDT</span>
            <a href="">9774.12</a>
          </li>
          <hr>
          <li style="margin-top: 8px"><a href="">Connect Sif Wallet ></a></li>
          <!-- <li>
            <span>Rowan</span>
            <a href="">481233.1222</a>
          </li>
          <li>
            <span>cUSDT</span>
            <a href="">12392.2</a>
          </li> -->
        </ul>
      </div>
      <div class="secondary-container">
        <span class="header">Pending Transactions</span>
        <hr />
        <ul>
          <li>
            <span>Peg: ETH -> cETH</span>
            <a href="">0x8e18317f...b9c253db3d1b054</a>
          </li>
          <li>
            <span>Peg: eRowan -> Rowan</span>
            <a href="">0x2kk3faxs...b9c253db3d1b054</a>
          </li>
          <li>
            <span>Unpeg: cETH -> ETH</span>
            <a href="">0x8e18317f...b9c253db3d1b054</a>
          </li>
        </ul>
      </div>


      <div class="secondary-container grey">
        <span class="header">History</span>
        <hr />
        <ul>
          <li>
            <span>Swap: cUNI -> cETH</span>
            <a href="">34E1E......97E89B5D2BCF6244F</a>
          </li>
          <li>
            <span>Add Liq: cUSDT/Rowan</span>
            <a href="">21kdE......97E89B5D2BCF6244F</a>
          </li>
          <li>
            <span>Unpeg: cETH -> ETH</span>
            <a href="">0x8e18317f...b9c253db3d1b054</a>
          </li>
        </ul>
      </div>
    </Panel>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Panel from "@/components/shared/Panel.vue";
import PanelNav from "@/components/navigation/PanelNav.vue";
import Icon from "@/components/shared/Icon.vue";
export default defineComponent({
  components: { Panel, PanelNav, Icon },
  props: {
    backLink: String,
    header: { type: Boolean, default: true },
    emitBack: {
      type: Boolean,
      default: false,
    },
    title: String,
  },
});
</script>

<style lang="scss" scoped>
.header.dark {
  background: #474747;
  color: white;
  padding: 16px;
  margin-bottom: 0px;
  font-size: 18px
}
.secondary-container {
  .header{ font-size: 16px; margin-bottom: 4px}
  padding: 16px;
  text-align: left;
  &.grey {
    background: #f0f0f0;
  }
  ul {
    margin-top: 8px;
    li {
      display: flex;
      flex-direction: row;
      span {
        margin-right: 8px;
      }
    }
  }
}
.layout {
  background: url("../../assets/World_Background_opt.jpg");
  background-size: cover;
  background-position: bottom center;
  box-sizing: border-box;
  padding-top: $header_height;
  width: 100%;
  height: 100vh; /* TODO: header height */
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: end;
  flex-direction: row;
}

.after {
  margin-top: 15px;
  padding: 25px;
  background: linear-gradient(180deg, $c_gray_50 0%, $c_gray_200 100%);
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
.back-link {
  text-align: left;
  display: block;
  text-decoration: none;
  position: relative;
  top: 2px;
  cursor: pointer;
}
.title {
  @include title16;
  flex-grow: 1;
  text-align: center;
}
</style>
