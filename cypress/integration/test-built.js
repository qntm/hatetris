/* global describe, it, cy */

describe('HATETRIS', () => {
  it('plays a game', () => {
    cy.visit('http://localhost:3000/dist/hatetris.html')
    cy.contains('You\'re playing HATETRIS by qntm')

    cy.get('button').contains('start new game').click()
    cy.get('.e2e__score').contains('0')

    for (let i = 0; i < 90; i++) {
      cy.get('body').trigger('keydown', { key: 'Down' })
    }

    cy.get('.e2e__score').contains('0')
    cy.get('.e2e__replay-out').contains('௨\u200Bට\u200Bໃ\u200Bݹ\u200B௨\u200Bට\u200Bໃ\u200Bݹ\u200Bठ')
  })

  it('plays a Base2048 replay', () => {
    const replay = 'ϥ\u200Bق\u200Bໂ\u200Bɝ\u200BƐ\u200Bඖ\u200BД\u200Bݹ\u200Bஶ\u200Bʈ\u200Bງ\u200BƷ\u200B௨\u200Bೲ\u200Bໃ\u200Bܤ\u200BѢ\u200Bق\u200BҾ\u200Bח\u200Bࢲ\u200Bට\u200Bฅ\u200Bڗ\u200B௨\u200BΡ\u200BІ\u200Bݪ\u200B௨\u200Bళ\u200Bȣ\u200Bݹ\u200Bࢴ\u200Bට\u200Bງ\u200B໒\u200B௨\u200Bஶ\u200Bໃ\u200Bܥ\u200B௨\u200Bറ\u200BІ\u200Bݮ\u200B௨\u200Bఴ\u200BІ\u200Bݥ\u200Bذ\u200Bඡ\u200Bଈ\u200Bݹ\u200Bƍ\u200Bق\u200B๓\u200Bঅ\u200Bஒ\u200Bॴ\u200Bแ\u200Bђ\u200Bञ\u200Bඖ\u200BЅ\u200Bи\u200B௨\u200Bs\u200BǶ\u200Bɔ\u200Bۑ\u200Bడ\u200BП\u200Bݷ\u200Bޠ\u200Bق\u200Bԩ\u200Bݹ\u200Bࠉ\u200Bൿ\u200Bຟ\u200Bɓ\u200Bత\u200Bණ\u200Bງ\u200Bஈ\u200Bশ\u200B੬\u200B෪\u200Bঅ\u200Bࠑ\u200Bථ\u200Bධ\u200Bٽ\u200Bଫ\u200B൝\u200Bଆ\u200Bࡨ\u200Bশ\u200B૫\u200BС\u200Bܭ\u200Bߜ\u200Bయ\u200Bլ\u200Bݚ\u200Bɶ\u200Bऋ\u200Bഭ\u200Bܭ\u200Bر\u200Bɤ\u200Bธ\u200BӃ\u200Bస\u200B൯'

    cy.visit('http://localhost:3000/dist/hatetris.html', {
      onBeforeLoad: window => {
        cy.stub(window, 'prompt').returns(replay)
      }
    })

    cy.get('button').contains('show a replay').click()

    for (let score = 0; score <= 11; score++) {
      cy.get('.e2e__score').contains(String(score), { timeout: 20000 })
    }

    cy.get('.e2e__replay-out').contains(replay)
  })
})
