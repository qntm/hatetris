'use strict'

/* eslint-env jasmine */

var getFirstState = require('./../src/js/get-first-state.js')
var getGetNextState = require('./../src/js/get-get-next-state.js')
var oriGen = require('./../src/js/ori-gen.js')
var replay = require('./../src/js/replay.js')
var getGetWorstPiece = require('./../src/js/get-get-worst-piece.js')

describe('check known replays', function () {
  var knowns = [
    {
      name: 'qntm-base65536',
      string: '𤆻𤆻𤆻𤆻𤆻𡚻',
      score: 0
    },
    {
      name: 'qntm-base2048',
      string: '௨ටໃݹ௨ටໃݹठ',
      score: 0
    },
    {
      name: 'Atypical-base65536',
      string: '㼬𤆻攌𣺻㼌𤂻𤇃㲬𤄋𤆜𠦻𥄸䂹𣸫𤇁𤦸𤄥𤚤𤂻𤇋𤪄𤆻邌𣊻𤅷𓎻𤆻𤆄𓊺𤆻𤄋㾅𢶻𤅛𤆢𣚻𤆴𓊺𣺻𤄲傣㾹㾸𢪱𢚻綸𢰋𠚻邌𠊹𣽋𤄰炸𤆳𣼰𤇀𣋋𣽛胇𓊸𠪻𥶻𣙻悻ꊬ肬𓎜𤲸𤺸𠤋𥇔傜𥆑𣹌𤋅𣼲做促',
      score: 11
    },
    {
      name: 'Atypical-base2048',
      string: 'ϥقໂɝƐඖДݹஶʈງƷ௨ೲໃܤѢقҾחࢲටฅڗ௨ΡІݪ௨ళȣݹࢴටງ໒௨ஶໃܥ௨റІݮ௨ఴІݥذඡଈݹƍق๓অஒॴแђञඖЅи௨sǶɔۑడПݷޠقԩݹࠉൿຟɓతණງஈশ੬෪অࠑථධٽଫ൝ଆࡨশ૫СܭߜయլݚɶऋഭܭرɤธӃస൯',
      score: 11
    },
    {
      name: 'SDA (1)-base65536',
      string: '𤅫肹𤂻𤄋点𣾻𤇀𤂀𤇀ꊺ𣪻𤆻𤇋𥮔𣺻𤇕𤶸𣾻𤇃𥆹𡒻𤅛𤇗邭𧆹𤶹𡎻𣼛𦥈𣪻𡒜𤄻𢊌𤄻𤆌肜𤶹𡊻𣽫𤇅𤆢傸𤚻𡊻𤄻𤇤𤂎𣹫𤃖𣿇𣻧𤃑𦥈𠪻𡒜𣼻𤧉𢊻𣾅𣋋𣡋𡞻𡊻𢈋𣸻胇醬𡈫𡩫𥪹𠆽𣿣𤹉𤃣郉炌㾬𣺅𤵛悸𤂣𣿁𤋁𡈻脻脛𤪕𣺤ᗊ',
      score: 17
    },
    {
      name: 'SDA (1)-base2048',
      string: 'ۑටժݹਐටดݹமsරݪƐජଈݲ௨ණໃφذගדݶಒටܨݹসටѧݹ൭ඤדݜ௧ซະਨதԀໃڻಜʈະसѻගІѠ௧ซະऄமϺเݹߤඨVܭѻඳІʅઅගتףயҔзݢऊටȝधѻೲܨݷಗචЄࡨଫඝܘɚமʈฅ๐ષ෦ฅ൩Ԥ๗ཚޡதԻѣݪॳ౾ແߢࡃశ༩ܣறඤÐњ௬ගƫঋ୦ԟȠॾಭ',
      score: 17
    },
    {
      name: 'SDA (2)-base65536',
      string: '𤅫肺𣾻𤄋𤶸𤂻𤇃𠪻𤆻偈𣺻𣽛𢨋𠚢𣺻𤅋𤶸𤂻𤄛𤮵𢪻𣪻邼𣹋𤅋炬𤒻𤆍𤾴𤁋𤅋𤃫𤇆傝綺𤇣綸𤷉𡒻𤄻𢊜𤄻邜𥆺𤪺𤊻𤅴𤆂傹𡊻𣼋𤇃𦾸𤑋膻𣹫𣹛𥇇傭𡒴𣼻𤹉𤇣𢊬𣉻𤀻𤇅𤋋𣹋𤀫𣼛𤃇𤃀怜𦪹𧆺𤲄邹𥪖𤎴𠨛炎𢊤炎𢊼𣠻ꋇ𤆂候傜㾬肜𤪔𤮸𤴫憸𢈛㼨𤯋𠆼眻𤺴ᕉ',
      score: 20
    },
    {
      name: 'SDA (2)-base2048',
      string: 'ۑටलݹञටฅཧஶʈໃŦ௨ਮܘݶذಗไӔƐකІݶಒටࡍݹصටलݲ௭ඈຯঅஶʈໃഡ௨ੲժݢ௨ཙງ൫ৎටफಏ௧Δαཧऊටฦџ௨ೱܘקஶΟໄ๐ஒقฐݹࢲقܨݹऍ੬ဒھۑశະकஶइഥಏதԻѣݸಣҔଜݸ౻ණໄঅࠁඡܘѣஶsࡎח৭ؾ૭ঔதඞ୩ڽഡలѣݢষܯ໐џஹڏ૭חɢචÐלமΟիॾ౯مຯםமȺЉރ௮ൿങھࠐ7',
      score: 20
    },
    {
      name: 'Ivenris-base65536',
      string: '𤇋𤞹𤆻傌𣊻𤄻ꊸ𣾻𤇇冺𤄫炜𢮻𤆻ꊌ𢪻𤆻邌𤆻𤊻𤅋𤆠𡊻𤂻𤇇醻𤅋𤆁𠮻𣾻𤅛㾌𢢻𤆻斄𤆻𤆆𥆸悻纻𤄻傼𤞻𢊻𤄻遜𤦹𡮻𤊻偃膸𤁛𤁋𤇅𣾻𤇄𤆠𤆼𠆜醹𣹋𤄛𣭛䂻𡢻𣦻𤂻𡉫悺綸𤄰傜催嶌𡬋𣻅𣻃𣉛𡉫𣸰𣉋𤅛𣻄𣈋𡉻𤲸冼𢭋㾼𤂂𢨻𣣆肹𣺃𣝛𣾳',
      score: 22
    },
    {
      name: 'Ivenris-base2048',
      string: 'ಳටܤݹஜƣແࡑ௨ఽໃݚޛඡܦݹরට๐ݹஜуເঅ௧ڈໃݹ௩Οເɕ௧ڠແऔ௨૮Іܢ௨කܘݓ௨౾Іݠ௨කƔݹகقฆݹϢඈՀݹభඨÐݚѻඍɑݚѻಬໃࡠɷళɑݢ௨ڈໃݷ౫ඡІމமҔธࡨஐට൧ۏଛقԟݱ௨മฆݠ௧ΑషݚɷٴฅՉதฃฅݶذڌฅٽࠑ൝ܘނஐؾʑɥࢶلܪݣ௫سଅݸԫצถܤஓඥ۵ݝ',
      score: 22
    },
    {
      name: 'SDA (3)-base65536',
      string: '𤅫𥆹𣾻𤇁𡊻𤄛炜𣺻㿃𢊻𤄻𠆬𢮻𤆻ꊌ𤆻肸邬𤆻𤊻𤅋𠆬𢊻𤅛𤄋𥆸𣊻𤅫𣞻𤊻𤄻𥆆𤇇肹肻𤶺𢊻𤲻𢮻𡊻𤄻𠮄炎𡪻𡒜𤄻𢊬𤄻𤆢傻𡊻𤀋𤇃𤪹𤎻𤅻𤇦𠆬𥚸𤆻炾纺𦧈𤊻炜肻肻𥆺肼邼𠆼𤲸𡢻𣞻𣊻𤈋𤀻𠫕𣺻𣿇𣻕𠙫𥢸趹𤇣𤹉𤇣𢊌𣸻𤇢旈𠲻𥆻催催炌炬𠆌𤂅㿃ꊌ𤂄𤇅肼𤂀𡋋𡉻偫𤊦𠠋為𤲢𣾲𠜻肼𣻆𤓇ᔻ',
      score: 28
    },
    {
      name: 'SDA (3)-base2048',
      string: 'ۑටݕݹযටະࠇ௧෪ໃܭИටܨݹસට๐ݹஜуໃݶԥڈໃݹ௩Οແऔ௧ฃໂɕ௧ڠແऄ௨ඥܘށ௨ౘЈཧதقഫݪޛೲໄ൫੫ගƬݶԊಋໃݒষܯໃץౚටࢩݹɷගVݪѻචȣݻޛඳଈף௧ڴໃݼѻദݏಏ௩Թໃڽௐقଭނ௩Ϻ༩ݶಈඝଈڍஶs༡ݸ൘Οະऔৡක૭ɒഩಬѣݲষܯະसѻಋଈजƐఽ໐ݪɷٴฅݸౚಀຯஇసضɱŦષට༣ܡஶضʑɠଢമ໘ܣறඡଢڝहథ༣ބஜҕऐ',
      score: 28
    },
    {
      name: 'Deasuke-base65536',
      string: '𤇃𢊻𤄻嶜𤄋𤇁𡊻𤄛𤆬𠲻𤆻𠆜𢮻𤆻ꊌ𢪻𤆻邌𤆻𤊻𤅋𤲥𣾻𤄋𥆸𣊻𤅛ꊌ𤆻𤆱炼綻𤋅𤅴薹𣪻𣊻𣽻𤇆𤚢𣺻赈𤇣綹𤻈𤇣𤾺𤇃悺𢦻𤂻𤅠㢹𣾻𤄛𤆓𤦹𤊻𤄰炜傼𤞻𢊻𣲻𣺻ꉌ邹𡊻𣹫𤅋𤇅𣾻𤇄𓎜𠚻𤊻𢊻𤉛𤅫𤂑𤃃𡉌𤵛𣹛𤁐𢉋𡉻𡡫𤇠𠞗𤇡𡊄𡒌𣼻燉𣼋𦄘炸邹㢸𠞻𠦻𡊻𣈻𡈻𣈛𡈛ꊺ𠆼𤂅𣻆𣫃𤮺𤊻𡉋㽻𣺬𣈛𡈋𤭻𤂲𣈻𤭻𤊼𢈛儛𡈛ᔺ',
      score: 30
    },
    {
      name: 'Deasuke-base2048',
      string: 'ౚටลݹமȺІݿ௨ගÐݸಳටɱݹশට๐ݹஜуເঅ௧ڈໃݹ௩Οເஜ௨ಗໃܭ௨൝ܘܭۑටຜݹౚඦͲஉݣටմݹԥ൝ໃѢ௨ɊІܥࡂܯໃρಛԀໃݪরටเݹਫටঋݹछقฐݹहටܨݹసقܨݺɷඩܘѧ௦قෆऄதටฅ൫ࠑඨɑݹமΟลຍஐق༱ݚذงໃͷશජХࢭಎටȻݢமҔСݐෂඞවౘஓӺХಏமԗVݏआඖໃϠஐΟවݶѻ౾ແࡑࢲඤÐɥઅඪຯஇಈ౾ຣݪذඪϽऔƐڠÐלஜҕɐזѻڐ༥މభ೯۱ࠇࢳ൯',
      score: 30
    },
    {
      name: 'chromeyhex-base65536',
      string: '𤂻愈䲻㰋𣻋㼘𤇀𠞻𤇋傜𣾻𤇋𤆦𠪵𤃄遈肼𡮻𤆻絈𤇄𤆴𥆹𤅛𤆻𤺸𤅋𤄋𥆺𠞻𤆻𥆐𠪻𠪄𤇄𣺁𤄋𡪄郈𢪻𤇄㲸㰈𤄋𤊁𤂻𤄜𡪼𣢻𡊀𣺻丘𤇋𤩘𣾻𥄈𠪻𤃋㰈𤀛蹌𤅋𤄋𡚡𤇋𤀜緊𣥋𤆜𤆁𠲼綹𥅘𣹋䰉𣼋蹊𤽋𤅋𤆌𤆰𡚡䲻𤇂𤆤𡪥𣚻𣢻𠮤𤺸𤅋𤂄𡘜羹𤇆㾸㶹𤀌𢙛𡞐𤆌㶺𥄩𡮴㺻𣣋𤃋𣛋𥆀𤺦ꉊ𣛄𠚀𠚜𤆀职𢊻徻蹈𢫄𣾻𤄌𤛋𡛁𡫋羌𡏋㼈𢢌𢢬𥂐𡫅𣪄𡊤肻𣊐㼸𢪠𢪄䂸𡪄趜𥀩𡙋𢢀𡊀𣺆㼩𤂄𡫇𡪴䲹𥄉𨂀',
      score: 31
    },
    {
      name: 'chromeyhex-base2048',
      string: '௨ഖƌݯߜࠏІWƑsໃa௨೯ܘݷಳජଈیԪؼʥݺԥඞܘݲࠐڄໂঅமةໃݹ௧ړІٽ௨൞ໃZ௨ಘІܥࠐΣІZߜටȜখذජНݹߛeʛݹߤปເѧ௩ԚໂՉࢸටuа௨સȣݷłقෆঅਏeܘԔצقషݸɢڠຜঀಧҸມѧஐට༪൩ԊಅഫܡथsถԡԦԚໃɥஸقࡈɕɠɈไݸצقషݰਵϺФঅஓػݐɓԞуຯɕझࡈ๐ݞझࢶІݞमปദஈƉؿଭݪஸҩЂ൸ԛمϦGƁҨVھԥචЅշࡂ෮लݷƘණ໘ࠅƘಧНקࢻҨฆӘದԋϝପࠑ੧ͳݲடփරݞਵΚϼɢԒԺٳѦԤࠌξGಘسਯܥஶҋϮτथlϼʔ',
      score: 31
    }
  ]

  var pieces = [
    [
      '....',
      '..##',
      '.##.',
      '....'
    ],
    [
      '....',
      '.##.',
      '..##',
      '....'
    ],
    [
      '....',
      '.##.',
      '.##.',
      '....'
    ],
    [
      '....',
      '####',
      '....',
      '....'
    ],
    [
      '....',
      '.###',
      '.#..',
      '....'
    ],
    [
      '....',
      '.##.',
      '.#..',
      '.#..'
    ],
    [
      '....',
      '.###',
      '..#.',
      '....'
    ]
  ]
  var orientations = oriGen(pieces)
  var bar = 4
  var wellDepth = 20 // min = bar
  var wellWidth = 10 // min = 4
  var getWorstPiece = getGetWorstPiece(orientations, bar, wellDepth, wellWidth)
  var getNextState = getGetNextState(orientations, bar, wellDepth, wellWidth)
  var firstState = getFirstState(wellDepth, getWorstPiece)

  var getReplay = function (string) {
    var moves = replay.decode(string)
    var state = firstState
    moves.forEach(function (move) {
      if (state.piece === null) {
        state.piece = getWorstPiece(state.well, state.highestBlue)
      }
      state = getNextState(state, move)
    })
    return state
  }

  knowns.forEach(function (known) {
    it(known.name, function () {
      expect(getReplay(known.string).score).toBe(known.score)
    })
  })
})
