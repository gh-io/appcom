import Com from './Com';
import { insert } from './Util';
import ERRORS from './ErrorMessages.js';

let events;

const mock = {
    notObjects         : [ null, 3, 1.23, function() {}, false, [], true, 'blah' ],
    notArraysOrObjects : [ null, 3, 1.23, function() {}, false ],
    notStrings         : [ null, 3, 1.23, function() {}, [], {}, false ],
    notFunctions       : [ 'notAFunction', null, 3, 1.23, [], {}, true, false ],
    separator          : '/',
    eventNames         : {
        // ok to broadcast
        SPECIFIC_ONE : '/some/event',
        SPECIFIC_TWO : '/some/other/event',
        VARIOUS      : {
            ONE : '/foo/bar',
            TWO : '/bazinga',
        },
        // ok to subscribe (also the ones above)
        CATCHALL     : '/',
        WILDCARD     : '/some/',
        // not ok, will give errors
        NO_PATH      : 'notInPathNotation',
        EMPTY_STRING : ''
    },
    callback           : function() {}
};

describe( 'Com', () => {

    beforeEach( () => {
        events = new Com();
        // spyOn(console, 'warn');
    } );

    afterEach( () => {
        events = null;
    } );


    it( 'should be defined', () => {
        expect( typeof Com ).toBe( 'function' );
    } );

    describe( 'setSeparator( separator )', () => {

        it( 'should have a method to set a separator for event names', () => {
            expect( typeof events.setSeparator ).toBe( 'function' );
        } );

        it( 'should throw when called more than one time', () => {
            expect( () => {
                events.setSeparator( '1' );
            } ).not.toThrow();
            expect( () => {
                events.setSeparator( '2' );
            } ).toThrowError( ERRORS.SEPARATOR_NOT_DYNAMIC );
        } );

        it( 'should only accept strings and throw otherwise', () => {
            mock.notStrings.forEach( nope => {
                expect( () => {
                    events.setSeparator( nope );
                } ).toThrowError( ERRORS.SPEARATOR_NO_STRING );
            } );
        } );

        it( 'should throw when string has not a length of 1', () => {
            expect( () => {
                events.setSeparator( 'whoWouldDoThis' );
            } ).toThrowError( ERRORS.SPEARATOR_LENGHT );
            expect( () => {
                events.setSeparator( '' );
            } ).toThrowError( ERRORS.SPEARATOR_LENGHT );
            expect( () => {
                events.setSeparator( '/' );
            } ).not.toThrow();
        } );

    } );

    describe( 'registerEventNames( arrayOrObject )', () => {

        it( 'should have a method to register event names', () => {
            expect( typeof events.registerEventNames ).toBe( 'function' );
        } );

        it( 'should throw when used before .setSeparator', () => {
            expect( () => {
                events.registerEventNames( [ '/some', '/values' ] );
            } ).toThrowError( ERRORS.SPEARATOR_NOT_SET );
            expect( () => {
                events.setSeparator( mock.separator );
                events.registerEventNames( [ '/some', '/values' ] );
            } ).not.toThrow();
        } );

        it( 'should accept an array', () => {
            expect( () => {
                events.setSeparator( mock.separator );
                events.registerEventNames( [ '/some', '/values' ] );
            } ).not.toThrow();
        } );

        it( 'should accept an object', () => {
            expect( () => {
                events.setSeparator( mock.separator );
                events.registerEventNames( { some : '/value' } );
            } ).not.toThrow();
        } );

        it( 'should throw when it gets not an object or an array', () => {
            events.setSeparator( mock.separator );
            mock.notArraysOrObjects.forEach( nope => {
                expect( () => {
                    events.registerEventNames( nope );
                } ).toThrowError( ERRORS.EVENTLIST_WRONG_FORMAT );
            } );
        } );

        it( 'should throw when duplicate event names were given', () => {
            events.setSeparator( mock.separator );
            expect( () => {
                events.registerEventNames( { aa : 'aa', bb : 'aa' } );
            } ).toThrowError( ERRORS.EVENT_NAME_DUPLICATES );
            expect( () => {
                events.registerEventNames( [ 'aaa', 'bbb', 'bbb' ] );
            } ).toThrowError( ERRORS.EVENT_NAME_DUPLICATES );
        } );

        it( 'should throw when no event names are found', () => {
            events.setSeparator( mock.separator );
            expect( () => {
                events.registerEventNames( {} );
            } ).toThrowError( ERRORS.NO_EVENT_NAMES_FOUND );
            expect( () => {
                events.registerEventNames( [] );
            } ).toThrowError( ERRORS.NO_EVENT_NAMES_FOUND );
        } );

        it( 'should throw when called more than one time', () => {
            events.setSeparator( mock.separator );
            expect( () => {
                events.registerEventNames( mock.eventNames );
            } ).not.toThrow();
            expect( () => {
                events.registerEventNames( mock.eventNames );
            } ).toThrowError( ERRORS.REGISTER_NOT_DYNAMIC );
        } );

    } );

    describe( 'broadcast( eventName, eventData )', () => {

        it( 'should have a method to send events', () => {
            expect( typeof events.broadcast ).toBe( 'function' );
        } );

        it( 'should throw when used before .registerEventNames()', () => {
            events.setSeparator( mock.separator );
            expect( () => {
                events.broadcast( '/name' );
            } ).toThrowError( ERRORS.REGISTER_EMPTY );
            expect( () => {
                events.registerEventNames( [ '/name' ] );
                events.broadcast( '/name' );
            } ).not.toThrow();
        } );


        it( 'should accept the event name as string as first parameter ...', () => {
            events.setSeparator( mock.separator );

            expect( () => {
                events.registerEventNames( [ '/name' ] );
                events.broadcast( '/name' );
            } ).not.toThrow();
        } );

        it( '... and throw otherwise', () => {
            events.setSeparator( mock.separator );
            events.registerEventNames( [ '/name' ] );
            mock.notStrings.forEach( nope => {
                expect( () => {
                    events.broadcast( nope );
                } ).toThrowError( ERRORS.EVENT_NAME_NOT_STRING );
            } );
        } );

        it( 'should accept the event data as object as second optional parameter ...', () => {
            events.setSeparator( mock.separator );
            events.registerEventNames( [ '/name' ] );
            expect( () => {
                events.broadcast( '/name', { event : 'data' } );
            } ).not.toThrow();
            expect( () => {
                events.broadcast( '/name' );
            } ).not.toThrow();
        } );

        it( '... and throw if its not an object', () => {
            events.setSeparator( mock.separator );
            events.registerEventNames( [ '/name' ] );
            mock.notObjects.forEach( nope => {
                expect( () => {
                    events.broadcast( '/name', nope );
                } ).toThrowError( ERRORS.EVENT_DATA_NOT_OBJECT );
            } );
        } );

        it( 'should throw when event name is not in path notation', () => {
            events.setSeparator( mock.separator );
            events.registerEventNames( mock.eventNames );
            expect( () => {
                events.broadcast( mock.eventNames.SPECIFIC_ONE );
            } ).not.toThrow();
            expect( () => {
                events.broadcast( mock.eventNames.NO_PATH );
            } ).toThrowError( insert( ERRORS.EVENT_NAME_NO_SEPARATOR, mock.separator ) );
            expect( () => {
                events.broadcast( mock.eventNames.EMPTY_STRING );
            } ).toThrowError( insert( ERRORS.EVENT_NAME_NO_SEPARATOR, mock.separator ) );
        } );

        it( 'should throw when event name is a wildcard or a catchall', () => {
            events.setSeparator( mock.separator );
            events.registerEventNames( mock.eventNames );
            expect( () => {
                events.broadcast( mock.eventNames.WILDCARD );
            } ).toThrowError( ERRORS.EVENT_NAME_IS_WILDCARD );
            expect( () => {
                events.broadcast( mock.eventNames.CATCHALL );
            } ).toThrowError( ERRORS.EVENT_NAME_IS_WILDCARD );
        } );

        it( 'should throw when event name is not registered', () => {
            events.setSeparator( mock.separator );
            events.registerEventNames( mock.eventNames );
            expect( () => {
                events.broadcast( '/NOT/REGISTERED' );
            } ).toThrowError( ERRORS.EVENT_NAME_NOT_REGISTERED );
        } );

        it( 'should call registered subscriptions callbackFunctions - for specific subs', () => {
            events.setSeparator( mock.separator );
            spyOn( mock, 'callback' );
            events.registerEventNames( mock.eventNames );
            let specificOne = events.subscribe( mock.eventNames.SPECIFIC_ONE, mock.callback );
            specificOne.start();
            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            expect( mock.callback ).toHaveBeenCalled();
        } );

        it( 'should call registered subscriptions callbackFunctions - for wildcard subs', () => {
            events.setSeparator( mock.separator );
            spyOn( mock, 'callback' );
            events.registerEventNames( mock.eventNames );
            let wildcard = events.subscribe( mock.eventNames.WILDCARD, mock.callback );
            wildcard.start();
            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            events.broadcast( mock.eventNames.SPECIFIC_TWO );
            expect( mock.callback ).toHaveBeenCalledTimes( 2 );
        } );

        it( 'should call registered subscriptions callbackFunctions - for catchalls', () => {
            events.setSeparator( mock.separator );
            spyOn( mock, 'callback' );
            events.registerEventNames( mock.eventNames );
            let catchall = events.subscribe( mock.eventNames.CATCHALL, mock.callback );
            catchall.start();
            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            events.broadcast( mock.eventNames.SPECIFIC_TWO );
            expect( mock.callback ).toHaveBeenCalledTimes( 3 );
        } );

        it( 'should call registered subscriptions callbackFunctions - for various combinations', () => {
            events.setSeparator( mock.separator );
            let callbacks = {
                specificOne : function () {
                },
                specificTwo : function () {
                },
                wildcard    : function () {
                },
                catchall    : function () {
                }
            };
            spyOn( callbacks, 'specificOne' );
            spyOn( callbacks, 'specificTwo' );
            spyOn( callbacks, 'wildcard' );
            spyOn( callbacks, 'catchall' );

            events.registerEventNames( mock.eventNames );

            let specificOne = events.subscribe( mock.eventNames.SPECIFIC_ONE, callbacks.specificOne );
            let specificTwo = events.subscribe( mock.eventNames.SPECIFIC_TWO, callbacks.specificTwo );
            let wildcard = events.subscribe( mock.eventNames.WILDCARD, callbacks.wildcard );
            let catchall = events.subscribe( mock.eventNames.CATCHALL, callbacks.catchall );
            specificOne.start();
            specificTwo.start();
            wildcard.start();
            catchall.start();

            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            events.broadcast( mock.eventNames.SPECIFIC_ONE ); // 4x
            events.broadcast( mock.eventNames.SPECIFIC_TWO );
            events.broadcast( mock.eventNames.SPECIFIC_TWO ); // 2x
            events.broadcast( mock.eventNames.VARIOUS.ONE );
            events.broadcast( mock.eventNames.VARIOUS.TWO );

            expect( callbacks.specificOne ).toHaveBeenCalledTimes( 4 );
            expect( callbacks.specificTwo ).toHaveBeenCalledTimes( 2 );
            expect( callbacks.wildcard ).toHaveBeenCalledTimes( 6 );
            expect( callbacks.catchall ).toHaveBeenCalledTimes( 8 );
        } );

        it( 'should pass data to callback functions - for specific subs', () => {
            events.setSeparator( mock.separator );
            spyOn( mock, 'callback' );
            events.registerEventNames( mock.eventNames );

            let specificOne = events.subscribe( mock.eventNames.SPECIFIC_ONE, mock.callback );
            specificOne.start();

            let eventData = { some : 'data' };
            events.broadcast( mock.eventNames.SPECIFIC_ONE, eventData );

            expect( mock.callback ).toHaveBeenCalledWith( eventData, {
                timestamp : jasmine.any( Number ),
                eventName : mock.eventNames.SPECIFIC_ONE,
                eventData : eventData
            } );
        } );

        it( 'should pass data to callback functions - for wildcard subs', () => {
            events.setSeparator( mock.separator );
            spyOn( mock, 'callback' );
            events.registerEventNames( mock.eventNames );

            let wildcard = events.subscribe( mock.eventNames.WILDCARD, mock.callback );
            wildcard.start();

            let eventData = { some : 'data' };
            events.broadcast( mock.eventNames.SPECIFIC_ONE, eventData );

            expect( mock.callback ).toHaveBeenCalledWith( eventData, {
                timestamp : jasmine.any( Number ),
                eventName : mock.eventNames.SPECIFIC_ONE,
                eventData : eventData
            } );
        } );

        it( 'should pass data to callback functions - for catchall subs', () => {
            events.setSeparator( mock.separator );
            spyOn( mock, 'callback' );
            events.registerEventNames( mock.eventNames );

            let catchall = events.subscribe( mock.eventNames.CATCHALL, mock.callback );
            catchall.start();

            let eventData = { some : 'data' };
            events.broadcast( mock.eventNames.SPECIFIC_ONE, eventData );

            expect( mock.callback ).toHaveBeenCalledWith( eventData, {
                timestamp : jasmine.any( Number ),
                eventName : mock.eventNames.SPECIFIC_ONE,
                eventData : eventData
            } );
        } );

    } );


    describe( 'subscribe( eventName, callbackFunction )', () => {

        it( 'should have a method to listen for events', () => {
            events.setSeparator( mock.separator );
            expect( typeof events.subscribe ).toBe( 'function' );
        } );

        it( 'should throw when used before .registerEventNames()', () => {
            events.setSeparator( mock.separator );
            expect( () => {
                events.subscribe( '/name', function () {
                } );
            } ).toThrowError( ERRORS.REGISTER_EMPTY );
            expect( () => {
                events.registerEventNames( [ '/name' ] );
                events.subscribe( '/name', function () {
                } );
            } ).not.toThrow();
        } );

        it( 'should accept the event name as string as first parameter ...', () => {
            events.setSeparator( mock.separator );
            expect( () => {
                events.registerEventNames( [ '/name' ] );
                events.subscribe( '/name', function () {
                } );
            } ).not.toThrow();
        } );

        it( '... and throw otherwise', () => {
            events.setSeparator( mock.separator );
            events.registerEventNames( [ '/name' ] );
            mock.notStrings.forEach( nope => {
                expect( () => {
                    events.subscribe( nope, function () {
                    } );
                } ).toThrowError( ERRORS.EVENT_NAME_NOT_STRING );
            } );
        } );

        it( 'should accept a callback function as second parameter ...', () => {
            events.setSeparator( mock.separator );
            events.registerEventNames( [ '/name' ] );
            expect( () => {
                events.subscribe( '/name', function () {
                } );
            } ).not.toThrow();
        } );

        it( '... and throw if its not given or not a function', () => {
            events.setSeparator( mock.separator );
            events.registerEventNames( [ '/name' ] );
            mock.notFunctions.forEach( nope => {
                expect( () => {
                    events.subscribe( '/name', nope );
                } ).toThrowError( ERRORS.EVENT_CALLBACK_NOT_FUNCTION );
            } );
        } );

        it( 'should throw when event name is not in path notation', () => {
            events.setSeparator( mock.separator );
            events.registerEventNames( mock.eventNames );
            expect( () => {
                events.subscribe( mock.eventNames.SPECIFIC_ONE, function () {
                } );
            } ).not.toThrow();
            expect( () => {
                events.subscribe( mock.eventNames.NO_PATH, function () {
                } );
            } ).toThrowError( insert( ERRORS.EVENT_NAME_NO_SEPARATOR, mock.separator ) );
            expect( () => {
                events.subscribe( mock.eventNames.EMPTY_STRING, function () {
                } );
            } ).toThrowError( insert( ERRORS.EVENT_NAME_NO_SEPARATOR, mock.separator ) );
        } );

        it( 'should throw when event name is not registered', () => {
            events.setSeparator( mock.separator );
            events.registerEventNames( mock.eventNames );
            expect( () => {
                events.subscribe( '/NOT/REGISTERED', function () {
                } );
            } ).toThrowError( ERRORS.EVENT_NAME_NOT_REGISTERED );
        } );

        it( 'should return a subscription object', () => {
            events.setSeparator( mock.separator );
            events.registerEventNames( mock.eventNames );
            let sub = events.subscribe( mock.eventNames.SPECIFIC_ONE, function () {
            } );
            expect( sub ).toEqual( jasmine.any( Object ) );
        } );

        it( 'subscription object - should have methods to manage the subscription', () => {
            events.setSeparator( mock.separator );
            events.registerEventNames( mock.eventNames );
            let sub = events.subscribe( mock.eventNames.SPECIFIC_ONE, function () {
            } );
            expect( typeof sub.kill ).toBe( 'function' );
            expect( typeof sub.start ).toBe( 'function' );
            expect( typeof sub.startWithLast ).toBe( 'function' );
            expect( typeof sub.startWithAll ).toBe( 'function' );
            expect( typeof sub.stop ).toBe( 'function' );
        } );

        it( 'subscription object - should stop listening after .stop() was called', () => {
            spyOn( mock, 'callback' );
            events.setSeparator( mock.separator );
            events.registerEventNames( mock.eventNames );

            let specificOne = events.subscribe( mock.eventNames.SPECIFIC_ONE, mock.callback );
            specificOne.start();

            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            specificOne.stop();
            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            events.broadcast( mock.eventNames.SPECIFIC_ONE );

            expect( mock.callback ).toHaveBeenCalledTimes( 2 );

        } );

        it( '... and resume when .start() was called again', () => {
            spyOn( mock, 'callback' );
            events.setSeparator( mock.separator );
            events.registerEventNames( mock.eventNames );

            let specificOne = events.subscribe( mock.eventNames.SPECIFIC_ONE, mock.callback );
            specificOne.start();

            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            specificOne.stop();
            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            specificOne.start();
            events.broadcast( mock.eventNames.SPECIFIC_ONE );

            expect( mock.callback ).toHaveBeenCalledTimes( 3 );

        } );

        it( 'subscription object - should get all events when .startWithAll() is called', () => {
            spyOn( mock, 'callback' );
            events.setSeparator( mock.separator );
            events.registerEventNames( mock.eventNames );

            let specificOne = events.subscribe( mock.eventNames.SPECIFIC_ONE, mock.callback );

            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            specificOne.startWithAll();
            expect( mock.callback ).toHaveBeenCalledTimes( 2 );

            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            events.broadcast( mock.eventNames.SPECIFIC_ONE );

            specificOne.stop();

            events.broadcast( mock.eventNames.SPECIFIC_ONE );

            expect( mock.callback ).toHaveBeenCalledTimes( 5 );

            specificOne.startWithAll();

            events.broadcast( mock.eventNames.SPECIFIC_ONE );
            events.broadcast( mock.eventNames.SPECIFIC_ONE );

            expect( mock.callback ).toHaveBeenCalledTimes( 13 );

        } );

        it( 'subscription object - should get last event when .startWithLast() is called - for specific', () => {
            spyOn( mock, 'callback' );
            events.setSeparator( mock.separator );
            events.registerEventNames( mock.eventNames );

            let specificOne = events.subscribe( mock.eventNames.SPECIFIC_ONE, mock.callback );

            specificOne.startWithLast();
            specificOne.stop();

            expect( mock.callback ).toHaveBeenCalledTimes( 0 );

            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 1 } );
            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 3 } );
            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 4 } );
            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 5 } );

            specificOne.startWithLast();
            specificOne.stop();

            expect( mock.callback ).toHaveBeenCalledTimes( 1 );
            expect( mock.callback ).toHaveBeenCalledWith( { value : 5 }, jasmine.any( Object ) );

            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 1 } );
            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 2 } );
            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 3 } );

            specificOne.startWithLast();

            expect( mock.callback ).toHaveBeenCalledTimes( 2 );
            expect( mock.callback ).toHaveBeenCalledWith( { value : 3 }, jasmine.any( Object ) );

        } );

        it( 'subscription object - should get last event when .startWithLast() is called - for wildcard', () => {
            spyOn( mock, 'callback' );
            events.setSeparator( mock.separator );
            events.registerEventNames( mock.eventNames );

            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 1 } );
            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 2 } );
            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 3 } );
            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 4 } );
            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 5 } );

            let wildcard = events.subscribe( mock.eventNames.WILDCARD, mock.callback );
            wildcard.startWithLast();

            expect( mock.callback ).toHaveBeenCalledWith( { value : 5 }, jasmine.any( Object ) );
            expect( mock.callback ).toHaveBeenCalledTimes( 1 );

            wildcard.stop();

            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 1 } );
            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 2 } );
            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 3 } );

            wildcard.startWithLast();

            expect( mock.callback ).toHaveBeenCalledTimes( 2 );
            expect( mock.callback ).toHaveBeenCalledWith( { value : 3 }, jasmine.any( Object ) );
        } );

        it( 'subscription object - should get last event when .startWithLast() is called - for catchall', () => {
            spyOn( mock, 'callback' );
            events.setSeparator( mock.separator );
            events.registerEventNames( mock.eventNames );

            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 1 } );
            events.broadcast( mock.eventNames.VARIOUS.ONE, { value : 2 } );
            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 3 } );
            events.broadcast( mock.eventNames.SPECIFIC_TWO, { value : 4 } );
            events.broadcast( mock.eventNames.VARIOUS.TWO, { value : 5 } );

            let all = events.subscribe( mock.eventNames.CATCHALL, mock.callback );
            all.startWithLast();

            expect( mock.callback ).toHaveBeenCalledWith( { value : 5 }, jasmine.any( Object ) );
            expect( mock.callback ).toHaveBeenCalledTimes( 1 );

            all.stop();

            events.broadcast( mock.eventNames.SPECIFIC_TWO, { value : 3 } );

            all.startWithLast();

            expect( mock.callback ).toHaveBeenCalledTimes( 2 );
            expect( mock.callback ).toHaveBeenCalledWith( { value : 3 }, jasmine.any( Object ) );
        } );

        it( 'subscription object - should disable subscription when .kill() was called', () => {
            spyOn( mock, 'callback' );
            events.setSeparator( mock.separator );
            events.registerEventNames( mock.eventNames );

            let all = events.subscribe( mock.eventNames.CATCHALL, mock.callback );
            all.start();

            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 1 } );
            events.broadcast( mock.eventNames.VARIOUS.ONE, { value : 2 } );

            all.kill();

            expect( mock.callback ).toHaveBeenCalledTimes( 2 );

            expect( () => {
                all.start();
            } ).toThrowError( ERRORS.SUB_WAS_KILLED_BEFORE );

            expect( () => {
                all.stop();
            } ).toThrowError( ERRORS.SUB_WAS_KILLED_BEFORE );

            expect( () => {
                all.startWithLast();
            } ).toThrowError( ERRORS.SUB_WAS_KILLED_BEFORE );

            expect( () => {
                all.startWithAll();
            } ).toThrowError( ERRORS.SUB_WAS_KILLED_BEFORE );

            expect( () => {
                all.kill();
            } ).toThrowError( ERRORS.SUB_WAS_KILLED_BEFORE );

            events.broadcast( mock.eventNames.VARIOUS.ONE, { value : 3 } );

            expect( mock.callback ).toHaveBeenCalledTimes( 2 );

        } );

        it( 'subscription object - should throw when it gets started multiple times', () => {
            spyOn( mock, 'callback' );
            events.setSeparator( mock.separator );
            events.registerEventNames( mock.eventNames );

            let all = events.subscribe( mock.eventNames.CATCHALL, mock.callback );
            all.start();

            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 1 } );
            events.broadcast( mock.eventNames.VARIOUS.ONE, { value : 2 } );

            expect( mock.callback ).toHaveBeenCalledTimes( 2 );

            expect( () => {
                all.start();
            } ).toThrowError( ERRORS.SUB_WAS_STARTED_BEFORE );

            expect( () => {
                all.startWithLast();
            } ).toThrowError( ERRORS.SUB_WAS_STARTED_BEFORE );

            expect( () => {
                all.startWithAll();
            } ).toThrowError( ERRORS.SUB_WAS_STARTED_BEFORE );

            events.broadcast( mock.eventNames.VARIOUS.ONE, { value : 3 } );

            expect( mock.callback ).toHaveBeenCalledTimes( 3 );

        } );

        it( 'subscription object - should throw when it gets stopped multiple times', () => {
            spyOn( mock, 'callback' );
            events.setSeparator( mock.separator );
            events.registerEventNames( mock.eventNames );

            let all = events.subscribe( mock.eventNames.CATCHALL, mock.callback );
            all.start();

            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 1 } );
            events.broadcast( mock.eventNames.VARIOUS.ONE, { value : 2 } );

            expect( mock.callback ).toHaveBeenCalledTimes( 2 );

            all.stop();

            events.broadcast( mock.eventNames.SPECIFIC_ONE, { value : 3 } );

            expect( mock.callback ).toHaveBeenCalledTimes( 2 );

            expect( () => {
                all.stop();
            } ).toThrowError( ERRORS.SUB_WAS_STOPPED_BEFORE );

            all.startWithLast();

            events.broadcast( mock.eventNames.VARIOUS.ONE, { value : 4 } );

            expect( mock.callback ).toHaveBeenCalledTimes( 4 );

        } );

    } );

