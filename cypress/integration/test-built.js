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
    cy.get('.e2e__replay-out').contains('௨ටໃݹ௨ටໃݹठ')
  })

  it('plays a Base2048 replay', () => {
    const replay = 'ϥقໂɝƐඖДݹஶʈງƷ௨ೲໃܤѢقҾחࢲටฅڗ௨ΡІݪ௨ళȣݹࢴටງ໒௨ஶໃܥ௨റІݮ௨ఴІݥذඡଈݹƍق๓অஒॴแђञඖЅи௨sǶɔۑడПݷޠقԩݹࠉൿຟɓతණງஈশ੬෪অࠑථධٽଫ൝ଆࡨশ૫СܭߜయլݚɶऋഭܭرɤธӃస൯'

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
