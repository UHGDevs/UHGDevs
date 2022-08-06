module.exports = {


  info: {
      content: null,
      embeds: [
        {
          title: "**Informace k G-Boxům**",
          description: "**Co jsou G-Boxy?** \nJde prakticky o loot boxy, které jdou odemknout klíčem koupeným za GEXPy.\n\n**Jak získám GEXPy?**\nGEXPy (<:gexp:999760130629456013>) jdou získat normálním hraním na Hypixelu _(/g member [váš nickname])_ nebo je lze vyhrát na UHG eventech.\n\n**Jak můžu G-Box otevřít?**\nNejdřív si musíte koupit klíč k danému boxu. Jsou 3 druhy boxů, Bronze (<:wooden_box_0:999761772061933619>) za 10,000 GEXP, Golden (<:golden_box_1:999762479452278854>) za 100,000 GEXP a Diamond (<:diamond_box_1:999762477367689248>) za 1,000,000 GEXP. Prakticky platíte za klíč (<:wooden_key:999762931623407637>,<:golden_key:999761802214789200>,<:diamond_key:999762928884535377>) nikoliv za G-Box. Po koupi klíče zjistíte jaká rarita klíče vám padla (Common<:wooden_key_common:999762976787673128>, Rare<:wooden_key_rare:999762983892815942>, Epic<:wooden_key_epic:999762979354595480>, Legendary<:wooden_key_legendary:999762981640486962>) a od toho se bude odvíjet i Váš loot v G-Boxu.\n\n**Jsou nějaké příkazy?**\nAno. Můžete je psát do <#555832215922278401>:\n``/inventory`` _(zobrazí, co vše máte z G-Boxů, kolik máte GEXP a jaké máte klíče)_\n``/bonzegbox`` _(zobrazí GUI pro Bronze G-Box)_\n``/goldgbox`` _(zobrazí GUI pro Golden G-Box)_\n``/diagbox`` _(zobrazí GUI pro Diamond G-Box)_\n``/keychance`` _(zobrazí šance na získání jednotlivých rarit klíčů)_\n``/loottable`` _(zobrazí všechny možné dropy z G- boxů a jejich % šance)_\n\n**Co když drop nechci/nemohu uplatnít?**\nVšechny dropy lze prodat, buď rovnou v GUI otevřeného G-Boxu pomocí tlačítka \"Prodat\" nebo pomocí příkazu /inventory, kde můžete konkrétní itemy spravovat.\n\n**Mám jiné dotazy než jsou uvedeny výše.**\nObraťte se na <@379640544143343618>, <@312861502073995265> nebo <@378928808989949964>.",
          color: 3092790
        }
      ],
      attachments: [],
      components: [
          {
              type: 'ACTION_ROW',
              components: [
                  {
                      type: 'BUTTON',
                      label: 'G-Boxy',
                      customId: 'LOOT_box',
                      style: 'PRIMARY',
                    //  emoji: { animated: false, name: '🎁', id: null },
                      url: null,
                      disabled: false
                  },
                  {
                      type: 'BUTTON',
                      label: 'Inventory',
                      customId: 'LOOT_inventory',
                      style: 'PRIMARY',
                    //  emoji: { animated: false, name: '🧺', id: null },
                      url: null,
                      disabled: false
                  }
              ]
          }
      ]
    },


    key_chance: {
      content: null,
      ephemeral: true,
      embeds: [
        {
          title: "Šance na klíče:",
          color: null,
          footer: {
            text: "*bronzový a diamantový klíč má stejné šance, zlatý klíč je pouze ukázka"
          },
          image: {
            url: "https://cdn.discordapp.com/attachments/408250362978369546/999757381963620422/klice.png"
          }
        }
      ],
    },


    box_bronze: {
      content: null,
      ephemeral: true,
      embeds: [
        {
          title: "Bronze G-Box",
          description: "Cena: 10,000 <:gexp:999760130629456013> GEXP",
          color: 3092790,
          footer: {
              text: "Pro otevření boxu je potřeba klíč"
          },
          image: {
            url: "https://cdn.discordapp.com/attachments/630779313813454890/999759632375484488/wooden_box_0.png"
          }
        }
      ],
      components: [
        {
            type: 'ACTION_ROW',
            components: [
                {
                    type: 'BUTTON',
                    label: 'Koupit Klíč',
                    customId: 'LOOT_BOX_buy_bronze',
                    style: 'PRIMARY',
                    url: null,
                    disabled: false
                },
                {
                    type: 'BUTTON',
                    label: 'Otevřít',
                    customId: 'LOOT_BOX_open_bronze',
                    style: 'SUCCESS',
                    url: null,
                    disabled: false
                }
            ]
        }
      ]
    },

    box_gold: {
      content: null,
      ephemeral: true,
      embeds: [
        {
          title: "Golden G-Box",
          description: "Cena: 100,000 <:gexp:999760130629456013> GEXP",
          color: 3092790,
          footer: {
            text: "Pro otevření boxu je potřeba klíč"
          },
          image: {
            url: "https://cdn.discordapp.com/attachments/630779313813454890/999759631943483422/golden_box_1.png"
          }
        }
      ],
      components: [
        {
            type: 'ACTION_ROW',
            components: [
                {
                    type: 'BUTTON',
                    label: 'Koupit Klíč',
                    customId: 'LOOT_BOX_buy_gold',
                    style: 'PRIMARY',
                    url: null,
                    disabled: false
                },
                {
                    type: 'BUTTON',
                    label: 'Otevřít',
                    customId: 'LOOT_BOX_open_gold',
                    style: 'SUCCESS',
                    url: null,
                    disabled: false
                }
            ]
        }
      ]
    },


    box_diamond: {
      content: null,
      ephemeral: true,
      embeds: [
          {
            title: "Diamond G-Box",
            description: "Cena: 1,000,000 <:gexp:999760130629456013> GEXP",
            color: 3092790,
            footer: {
              text: "Pro otevření boxu je potřeba klíč"
            },
            image: {
              url: "https://cdn.discordapp.com/attachments/630779313813454890/999759631557599392/diamond_box_1.png"
            }
          }
      ],
      components: [
        {
            type: 'ACTION_ROW',
            components: [
                {
                    type: 'BUTTON',
                    label: 'Koupit Klíč',
                    customId: 'LOOT_BOX_buy_diamond',
                    style: 'PRIMARY',
                    url: null,
                    disabled: false
                },
                {
                    type: 'BUTTON',
                    label: 'Otevřít',
                    customId: 'LOOT_BOX_open_diamond',
                    style: 'SUCCESS',
                    url: null,
                    disabled: false
                }
            ]
        }
      ]
    },


    loottable_bronze: {
      ephemeral: true,
      content: null,
      embeds: [
        {
          "title": "**Bronze G-Box loot table**",
          "color": 3092790,
          "fields": [
            {
              "name": "COMMON KEY",
              "value": "2,000-6,000 <:gexp:999760130629456013> GEXP\n50,000 <:networthrole:999768297480409168> SB Coins",
              "inline": true
            },
            {
              "name": "RARE KEY",
              "value": "5% sleva na UHG tričko \n150,000 <:networthrole:999768297480409168> SB Coins\n5-10 <:sbgems:999770318207975504> SB Gems\n5-10 <:hypixelgoldv2:999771371972345876> Hypixel Gold",
              "inline": true
            },
            {
              "name": "ㅤ",
              "value": "ㅤ"
            },
            {
              "name": "EPIC KEY",
              "value": "10% sleva na UHG tričko \n11-20 <:sbgems:999770318207975504> SB Gems\n11-20 <:hypixelgoldv2:999771371972345876> Hypixel Gold",
              "inline": true
            },
            {
              "name": "LEGENDARY KEY",
              "value": "20% sleva na UHG tričko\n50 <:sbgems:999770318207975504> Gems\n50 <:hypixelgoldv2:999771371972345876> Hypixel Gold\n<:e6d6709c969b73397cd84cf77c96fa36:999772539096141854> Rank Upgrade",
              "inline": true
            }
          ],
          "thumbnail": {
            "url": "https://cdn.discordapp.com/attachments/630779313813454890/999759632375484488/wooden_box_0.png"
          }
        }
      ]
    }

    
}