/* global describe, it, cy */

describe('HATETRIS', () => {
  it('plays a game', () => {
    cy.visit('http://localhost:3000/hatetris.html')
    cy.contains('you\'re playing HATETRIS by qntm')

    cy.get('button').contains('start new game').click()
    cy.get('.e2e__score').contains('0')

    for (let i = 0; i < 90; i++) {
      cy.get('body').trigger('keydown', { key: 'Down' })
    }

    cy.get('.e2e__score').contains('0')
    cy.get('.e2e__replay-out').contains('௨ටໃݹ௨ටໃݹठ')
  })

  it('plays an easy game', () => {
    cy.visit('http://localhost:3000/hatetris.html')
    cy.contains('you\'re playing HATETRIS by qntm')

    cy.get('button').contains('select AI').click()
    cy.get('button').contains('all 4x1 pieces').click()
    cy.get('button').contains('start new game').click()
    cy.get('.e2e__score').contains('0')

    for (let i = -5; i <= 4; i++) {
      // Rotate until vertical
      cy.get('.e2e__up').click()

      // Move to correct column
      if (i < 0) {
        for (let j = 0; j > i; j--) {
          cy.get('.e2e__left').click()
        }
      } else {
        for (let j = 0; j < i; j++) {
          cy.get('.e2e__right').click()
        }
      }

      // Drop
      for (let j = 0; j < 17; j++) {
        cy.get('.e2e__down').click()
      }
    }

    cy.get('.e2e__score').contains('4')
    // no replay
  })

  it('plays with a custom AI', () => {
    cy.visit('http://localhost:3000/hatetris.html', {
      onBeforeLoad: window => {
        cy.stub(window, 'prompt').returns('() => () => \'O\'')
      }
    })

    cy.get('button').contains('select AI').click()
    cy.get('button').contains('use custom AI').click()
    cy.get('button').contains('start new game').click()

    for (let i = -4; i <= 4; i += 2) {
      // Move to correct column
      if (i < 0) {
        for (let j = 0; j > i; j--) {
          cy.get('.e2e__left').click()
        }
      } else {
        for (let j = 0; j < i; j++) {
          cy.get('.e2e__right').click()
        }
      }

      // Drop
      for (let j = 0; j < 18; j++) {
        cy.get('.e2e__down').click()
      }
    }

    cy.get('.e2e__score').contains('2')
  })

  it('plays a Base2048 replay', () => {
    const replay = 'ϥقໂɝƐඖДݹஶʈງƷ௨ೲໃܤѢقҾחࢲටฅڗ௨ΡІݪ௨ళȣݹࢴටງ໒௨ஶໃܥ௨റІݮ௨ఴІݥذඡଈݹƍق๓অஒॴแђञඖЅи௨sǶɔۑడПݷޠقԩݹࠉൿຟɓతණງஈশ੬෪অࠑථධٽଫ൝ଆࡨশ૫СܭߜయլݚɶऋഭܭرɤธӃస൯'

    cy.visit('http://localhost:3000/hatetris.html', {
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
