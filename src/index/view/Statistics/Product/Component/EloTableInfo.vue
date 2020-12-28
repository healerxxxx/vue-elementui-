<template>
  <div class="eloDetailInfo">
    <h2>{{title}}方案</h2>
    <p>理论 VS 百家赔率</p>
    <ul>
      <li class="text-left">&nbsp;</li>
      <li>胜</li>
      <li>平</li>
      <li>负</li>
    </ul>
    <ul v-if="eloInfo.theoryOdds && !(eloInfo.theoryOdds.euWinOdds===0&&eloInfo.theoryOdds.euDrawOdds===0&&eloInfo.theoryOdds.euLossOdds===0)">
      <li class="text-left">理论</li>
      <li>{{eloInfo.theoryOdds.euWinOdds}}</li>
      <li>{{eloInfo.theoryOdds.euDrawOdds}}</li>
      <li>{{eloInfo.theoryOdds.euLossOdds}}</li>
    </ul>
    <ul v-if="eloInfo.averOdds && !(eloInfo.averOdds.euWinOdds===0&&eloInfo.averOdds.euDrawOdds===0&&eloInfo.averOdds.euLossOdds===0)">
      <li class="text-left">百家</li>
      <li>
        {{eloInfo.averOdds.euWinOdds}}
        <span v-if="parseInt(eloInfo.averOddsDisplayPosition)==1">(<i style="color:green;" v-if="/\-/g.test(eloInfo.averOddsDiffRate)">↓</i><i style="color:red;" v-else>↑</i>{{(Math.round(eloInfo.averOddsDiffRate*10000)/100+'%').replace(/\-/,'')}})</span>
      </li>
      <li>
        {{eloInfo.averOdds.euDrawOdds}}
        <span v-if="parseInt(eloInfo.averOddsDisplayPosition)==0">(<i style="color:green;" v-if="/\-/g.test(eloInfo.averOddsDiffRate)">↓</i><i style="color:red;" v-else>↑</i>{{(Math.round(eloInfo.averOddsDiffRate*10000)/100+'%').replace(/\-/,'')}})</span>
      </li>
      <li>
        {{eloInfo.averOdds.euLossOdds}}
        <span v-if="parseInt(eloInfo.averOddsDisplayPosition)==-1">(<i style="color:green;" v-if="/\-/g.test(eloInfo.averOddsDiffRate)">↓</i><i style="color:red;" v-else>↑</i>{{(Math.round(eloInfo.averOddsDiffRate*10000)/100+'%').replace(/\-/,'')}})</span>
      </li>
    </ul>
    <p v-if="eloInfo.averOddsDiffRate">百家平均欧赔比理论赔率<i>{{/\-/g.test(eloInfo.averOddsDiffRate)?'低':'高'}}{{(Math.round(eloInfo.averOddsDiffRate*10000)/100+'%').replace(/\-/,'')}}，有</i>投注价值</p>
    <h2>{{title}}参考方案</h2>
    <ul v-if="eloInfo.referAsiaOddsVo&&!(eloInfo.referAsiaOddsVo.asiaUpOdds===0&&eloInfo.referAsiaOddsVo.asiaConcede===0&&eloInfo.referAsiaOddsVo.asiaDownOdds===0)">
      <li class="text-left">亚盘<div class="red" v-if="eloInfo.referAsiaOddsVo.isAsiaHit===1">已中</div><div class="blue" v-if="eloInfo.referAsiaOddsVo.isAsiaHit===2">走盘</div><div class="black" v-if="eloInfo.referAsiaOddsVo.isAsiaHit===0">未中</div></li>
      <li :class="{'hit': eloInfo.referAsiaOddsVo.asiaResultItem===1&&eloInfo.referAsiaOddsVo.isAsiaHit!=2, 'check':eloInfo.referAsiaOddsVo.suggestAsiaItem===1}">主赔 {{eloInfo.referAsiaOddsVo.asiaUpOdds}}</li>
      <li>{{eloInfo.referAsiaOddsVo.asiaConcede > 0 ? '+' : ''}}{{eloInfo.referAsiaOddsVo.asiaConcede}}</li>
      <li :class="{'hit': eloInfo.referAsiaOddsVo.asiaResultItem===-1&&eloInfo.referAsiaOddsVo.isAsiaHit!=2, 'check':eloInfo.referAsiaOddsVo.suggestAsiaItem===-1}">客赔 {{eloInfo.referAsiaOddsVo.asiaDownOdds}}</li>
    </ul>
    <ul v-if="eloInfo.referEuOddsVo&&!(eloInfo.referEuOddsVo.euWinOdds===0&&eloInfo.referEuOddsVo.euDrawOdds===0&&eloInfo.referEuOddsVo.euLossOdds===0)">
      <li class="text-left">欧赔<div class="red" v-if="eloInfo.referEuOddsVo.isEuropeHit===1">已中</div><div class="blue" v-if="eloInfo.referEuOddsVo.isEuropeHit===2">走盘</div><div class="black" v-if="eloInfo.referEuOddsVo.isEuropeHit===0">未中</div></li>
      <li :class="{'hit': eloInfo.referEuOddsVo.euResultItem===1&&eloInfo.referEuOddsVo.isEuropeHit!=2, 'check':eloInfo.referEuOddsVo.suggestEuropeItem===1}">胜 {{eloInfo.referEuOddsVo.euWinOdds}}</li>
      <li :class="{'hit': eloInfo.referEuOddsVo.euResultItem===0&&eloInfo.referEuOddsVo.isEuropeHit!=2, 'check':eloInfo.referEuOddsVo.suggestEuropeItem===0||eloInfo.referEuOddsVo.isDoubleSelection===1}">平 {{eloInfo.referEuOddsVo.euDrawOdds}}</li>
      <li :class="{'hit': eloInfo.referEuOddsVo.euResultItem===-1&&eloInfo.referEuOddsVo.isEuropeHit!=2, 'check':eloInfo.referEuOddsVo.suggestEuropeItem===-1}">负 {{eloInfo.referEuOddsVo.euLossOdds}}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'EloTableInfo',
  props: ['eloInfo', 'title']
}
</script>

<style lang="scss">
.eloDetailInfo {
  h2 {
    padding-left:10px;
    font-size:14px;
    font-weight: bold;
    line-height:1;
    position: relative;
    margin: 8px 0;
    color: #333;
    &:before {
      position: absolute;
      left: 0;
      top:0;
      content: '';
      height: 100%;
      width: 3px;
      background: #e62121;
    }
  }
  p {
    padding: 5px 0;
    line-height: 1.2;
    color: #666;
    i {
      font-style: normal;
      color: #e62121;
    }
  }
  ul {
    font-size: 0;
    margin-bottom: 6px;
    li {
      position: relative;
      display: inline-block;
      width: 110px;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      line-height: 1;
      border: 1px solid #d9d9d9;
      border-right: 0;
      text-align: center;
      padding: 8px 0;
      font-size: 12px;
      vertical-align: top;
      span i {
        font-style: normal;
      }
      &:last-child {
        border-right: 1px solid #d9d9d9;
      }
      &.text-left {
        border: 0;
        text-align: left;
        width: 60px;
        overflow: hidden;
        margin-right: 10px;
      }
      &.check{
        background: #aaa;
        color: #fff;
      }
      &.hit:after{
        position: absolute;
        top:-6px;
        right: 4px;
        content: '√';
        width:20px;
        height: 20px;
        background: #e62121;
        border-radius: 100%;
        -webkit-border-radius: 100%;
        text-align: center;
        line-height: 20px;
        font-size:12px;
        color: #fff;
        z-index: 1;
      }
      .red,.blue,.black{
        display: block;
        position: absolute;
        right: -24px;
        top:-24px;
        width: 48px;
        padding-top:32px;
        text-align: center;
        content: '';
        color: #fff;
        line-height: 1;
        font-size:12px;
        z-index: 1;
        transform: rotate(45deg);
        -webkit-transform: rotate(45deg);
        background: #e62121;
      }
      .red{
        background: #e62121;
      }
      .blue{
        background: #02a2de;
      }
      .black{
        background: #000;
      }
    }
  }
}
</style>
