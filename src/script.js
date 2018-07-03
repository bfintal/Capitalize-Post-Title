import capitalize from 'title-capitalization'
import DocReady from 'es6-docready'

const capitalizeInput = el => {

    // Remember old value so we can allow manual case edits.
    if ( el.oldLowerCaseVal !== undefined ) {
        if ( el.oldLowerCaseVal === el.value.toLowerCase() ) {
            return
        }
    }

    // Remember caret position, and bring it back later.
    let cursorPos
    const isSelected = document.activeElement === el
    if ( isSelected ) {
        cursorPos = el.selectionStart;
    }
    
    // Capitalize!
    el.value = capitalize( el.value )
    el.oldLowerCaseVal = el.value.toLowerCase()

    if ( isSelected ) {
        el.setSelectionRange( cursorPos, cursorPos );
    }
}

DocReady( () => {
    const inputs = document.querySelectorAll( 'input[name="post_title"' );
    inputs.forEach( el => {
        let timeout = null
        el.addEventListener( 'keyup', () => {
            clearTimeout( timeout );
            timeout = setTimeout( () => {
                capitalizeInput( el )
            }, 1000 )
        } )
        el.addEventListener( 'keydown', () => {
            clearTimeout( timeout );
        } )
        el.addEventListener( 'change', () => {
            capitalizeInput( el )
        } )
        el.addEventListener( 'blur', () => {
            capitalizeInput( el )
        } )
    } )
} )