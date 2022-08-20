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
  
    static romanize(num) {
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
      let date = new Date(unix)
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
  }
  
  module.exports = ApiFunctions
  