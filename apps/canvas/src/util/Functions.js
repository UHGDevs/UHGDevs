const { Canvas } = require('skia-canvas');

class ApiFunctions {

    static f(number, max=2) {
      if (!Number(number)) return number
      return Number(number).toLocaleString('en', {minimumFractionDigits: 0, maximumFractionDigits: max})
    }
  
    static ratio(n1=0, n2=0, n3=2) {
      let options = {minimumFractionDigits: 0, maximumFractionDigits: n3};
      return Number(Number(isFinite(n1 / n2) ? + (n1 / n2) : n1).toLocaleString('en', options))
    }
  
    static Fromanize(num) {
      if (num == 0) return 0
      var lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1},roman = '',i;
      for ( i in lookup ) {
        while ( num >= lookup[i] ) {
          roman += i;
          num -= lookup[i];
        }
      }
      return roman;
    }
  
    static money(n) {
        if (!Number(n)) return n
        if (n<1000) return n
        else if (n>=1000 && n<1000000) return Math.floor(n/100)/10 + "K"
        else if (n>=1000000 && n<1000000000) return Math.floor(n/10000)/100 + "M"
        else return Math.floor(n/10000000)/100 + "B"
    }
    
    static r(n){
        try {Number(n)} catch {return n}
        console.log(n)
        let d = String(n).length
        let s;
        d = Math.pow(10,d)
        let i=7
        while(i)(s=Math.pow(10,i--*3))<=n&&(n=Math.floor(Math.round(n*d/s)/d)+"kMGTPE"[i])
        return n
    }

    static clear(message) { return message.replace(/✫|✪|⚝/g, '?').replace(/§|¡±/g, '�').replace(/�[0-9A-FK-OR]/gi, '') }

    static toDate(unix) {
      let date = new Date(Number(unix))
      return date.toLocaleDateString("cs-CZ")
    }

    static fCtx(ctx, options = {}) {
        ctx.font = options.font || '24px Minecraft'
        ctx.fillStyle = options.fillStyle || options.color || ''
     
        return ctx
    }

    static createCanvas(options) {
        if (!options.text) return {}
        let dim = options.ctx.measureText(options.text)
        let canvas = new Canvas(dim.width || 300, dim.height || 40);
     
        let ctx = canvas.getContext('2d')
        ctx.fillStyle = options.color
        ctx.font = options.font

        ctx.fillText(options.text, 0, 30)
        return canvas
     }

     static displayText(dim, oldctx, text, api) {
      let width = dim.width
      if (text == 'aps') {
         var a = '18px Minecraft', b = '15px Minecraft'
         oldctx.font = a
         width += oldctx.measureText(`${this.f(api.hypixel.aps)}`).width
         oldctx.font = b
         width += oldctx.measureText(` [Legacy ${this.f(api.hypixel.legacyAps)}]`).width
      }
      let canvas = new Canvas(width, 40);
      let ctx = this.fCtx(canvas.getContext('2d'), {color: api.hypixel.color})
   
      if (text == 'aps') {
         let x = 0, y = 30
         ctx.fillStyle = '#FFAA00'
   
         ctx.font = a
         ctx.fillText(`${this.f(api.hypixel.aps)}`, x, y)
         x += ctx.measureText(`${this.f(api.hypixel.aps)}`).width
   
         ctx.font = b
         ctx.fillText(` [Legacy ${this.f(api.hypixel.legacyAps)}]`, x, y)
         x += ctx.measureText(` [Legacy ${this.f(api.hypixel.legacyAps)}]`).width
      }
      else if (text == 'name') {
         let x = 0, y = 30
         let color = api.hypixel.color
   
         if (api.hypixel.rank.includes('MVP+')) {
            let plusColor = api.hypixel.color
            color = "#55ffff"
            if (api.hypixel.rank.includes('++')) color = "#fcba03"
   
            ctx.fillStyle = color
            ctx.fillText(`[MVP`, x, y)
            x += ctx.measureText(`[MVP`).width
            
            ctx.fillStyle = plusColor
            ctx.fillText(api.hypixel.rank.replace('MVP', ''), x, y)
            x += ctx.measureText(api.hypixel.rank.replace('MVP', '')).width
   
            ctx.fillStyle = color
            ctx.fillText(`] ${api.hypixel.username}`, x, y)
            x += ctx.measureText(`] ${api.hypixel.username}`).width
         } else {
            if (api.hypixel.rank == 'YOUTUBE') {
               ctx.fillStyle = color[0]
               ctx.fillText(`[`, x, y)
               x += ctx.measureText(`[`).width
   
               ctx.fillStyle = color[1]
               ctx.fillText(`YOUTUBE`, x, y)
               x += ctx.measureText(`YOUTUBE`).width
   
               ctx.fillStyle = color[0]
               ctx.fillText(`] ${api.hypixel.username}`, x, y)
               x += ctx.measureText(`] ${api.hypixel.username}`).width
            }
            else if (api.hypixel.rank == 'VIP+') {
               ctx.fillStyle = color
               ctx.fillText(`[VIP`, x, y)
               x += ctx.measureText(`[VIP`).width
   
               ctx.fillStyle = '#FFAA00'
               ctx.fillText(`+`, x, y)
               x += ctx.measureText(`+`).width
   
               ctx.fillStyle = color
               ctx.fillText(`] ${api.hypixel.username}`, x, y)
               x += ctx.measureText(`] ${api.hypixel.username}`).width
            }
            else {
               ctx.fillText(api.hypixel.prefix, x, y)
               x += ctx.measureText(api.hypixel.prefix).width
            }
         }
         if (api.guild.tag) {
            ctx.fillStyle = api.guild.color
            ctx.fillText(` [${api.guild.tag}]`, x, y)
         }
      }
      return canvas
   }
  }
  
  module.exports = ApiFunctions
  