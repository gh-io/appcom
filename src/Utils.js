export function replaceAll( search, replacement, target ) {
    return target.split( search ).join( replacement );
}

export function insert( target, ...replacements ) {
    let placeholderStart = '{',
        placeholderEnd   = '}';
    for ( let [ i, value ] of replacements.entries() ) {
        target = replaceAll( placeholderStart + i + placeholderEnd, value, target );
    }
    return target;
}

export function inArray( needle, object, searchInKey ) {

    if ( Object.prototype.toString.call( needle ) === '[object Object]' ||
        Object.prototype.toString.call( needle ) === '[object Array]' ) {
        needle = JSON.stringify( needle );
    }

    return Object.keys( object ).some(
        function ( key ) {

            let value = object[ key ];

            if ( Object.prototype.toString.call( value ) === '[object Object]' ||
                Object.prototype.toString.call( value ) === '[object Array]' ) {
                value = JSON.stringify( value );
            }

            if ( searchInKey ) {
                if ( value === needle || key === needle ) {
                    return true;
                }
            } else {
                if ( value === needle ) {
                    return true;
                }
            }
        }
    );
}
