import { apStyleTitleCase as _capitalize } from 'ap-style-title-case'
const { registerPlugin } = wp.plugins
const { select, dispatch, useSelect } = wp.data
const { useEffect, useCallback, useRef, useState, createElement, Fragment } = wp.element
const { addFilter } = wp.hooks
const { createHigherOrderComponent } = wp.compose

const capitalize = value => {
    return _capitalize( value.replace( /wordpress/gi, 'WordPress' ) )
}

const useDeviceType = () => {
	const { deviceType } = useSelect( select => {
		let deviceType = 'Desktop'

		// In some editors, there is no edit-post / preview device type. If that
		// happens, we just set our own internal device type.
		deviceType = select( 'core/edit-site' )?.__experimentalGetPreviewDeviceType() ||
			select( 'core/edit-post' )?.__experimentalGetPreviewDeviceType() ||
			select( 'stackable/device-type' ).getDeviceType()

		return { deviceType }
	}, [] )

	return deviceType || ''
}

const CapitalizeTitle = () => {
    const [ , setPrevTitle ] = useState( select( 'core/editor' ).getEditedPostAttribute( 'title' ) )
    const [ forceUpdate, setForceUpdate ] = useState( 0 )
    const deviceType = useDeviceType()

    useEffect( () => {
        // When the device type changes, we need to re-attach the event listener.
        const titleEl = document.querySelector( '.editor-post-title__input' ) || 
            // The title element is in an iframe in the block editor when in tablet or mobile.
            document.querySelector( 'iframe[name="editor-canvas"]' )?.contentDocument?.querySelector( '.editor-post-title__input' )

        if ( ! titleEl ) {
            // No title element found, maybe tablet/mobile is still resizing, retry later.
            setTimeout( () => {
                setForceUpdate( n => n < 100 ? n + 1 : n ) // Don't try too much.
            }, 250 )
            return
        }

        const updateTitleFunc = () => {
            setPrevTitle( prevTitle => {
                const title = select( 'core/editor' ).getEditedPostAttribute( 'title' )

                if ( prevTitle.toLowerCase() !== title.toLowerCase() ) {
                    const newTitle = capitalize( title )
                    dispatch( 'core/editor' ).editPost( { title: newTitle } );
                    return newTitle
                }
                
                return prevTitle
            } )
        }

        titleEl.addEventListener( 'blur', updateTitleFunc )
        return () => titleEl.removeEventListener( 'blur', updateTitleFunc )
    }, [ deviceType, forceUpdate ] )

    return null
}

registerPlugin( 'capitalize-title', { render: CapitalizeTitle } )

const capitalizeHtml = htmlContent => {
    const el = document.createElement( 'div' )
    el.innerHTML = htmlContent

    // Capitalize the text.
    const textNodes = Array.from( el.childNodes ).filter( node => node.nodeType === Node.TEXT_NODE )
    textNodes.forEach( node => {
        node.textContent = capitalize( node.textContent )
    } )

    // Capitalize all the inner text nodes.
    el.querySelectorAll( '*' ).forEach( node => {
        // Loop through all text nodes
        node.childNodes.forEach( childNode => {
            if ( childNode.nodeType === Node.TEXT_NODE ) {
                childNode.textContent = capitalize( childNode.textContent )
            }
        } )
    } )

    return el.innerHTML
}

const withCapitalizeHeadings = createHigherOrderComponent( 
    BlockEdit => props => {
        const { name, isSelected, attributes, setAttributes } = props
        const prevText = useRef( '' )

        // Sets initial value of the prevText ref when we first load the block.
        useEffect( () => {
            if ( prevText.current === '' ) {
                if ( name === 'core/heading' && attributes.content ) {
                    prevText.current = attributes.content
                } else if ( name === 'stackable/heading' && attributes.text ) {
                    prevText.current = attributes.text
                }
            }
        }, [] )

        useEffect( () => {
            // On select, remember the current text.
            if ( isSelected ) {
                if ( name === 'core/heading' ) {
                    prevText.current = attributes.content
                } else if ( name === 'stackable/heading' ) {
                    prevText.current = attributes.text
                }

            // On blur, if the characters of the text has changed, capitalize it.
            } else {
                if ( name === 'core/heading' ) {
                    if ( prevText.current.toLowerCase() !== attributes.content.toLowerCase() ) {
                        const newContent = capitalizeHtml( attributes.content )
                        setAttributes( { content: newContent } )
                    }
                } else if ( name === 'stackable/heading' ) {
                    if ( prevText.current.toLowerCase() !== attributes.text.toLowerCase() ) {
                        const newContent = capitalizeHtml( attributes.text )
                        setAttributes( { text: newContent } )
                    }
                }
            }
        }, [ isSelected ] ) // Only do this when the block is selected or unselected.

        return createElement( BlockEdit, { ...props } )
    },
    'withInspectorControl'
)

addFilter(
    'editor.BlockEdit',
    'capitzalize-headings',
    withCapitalizeHeadings
)