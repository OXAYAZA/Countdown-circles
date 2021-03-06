"use strict";

/**
 * @module   ProgressCircle
 * @version  0.2.0
 * @author   OXAYAZA {@link https://github.com/OXAYAZA}
 * @license  CC BY-SA 4.0 {@link https://creativecommons.org/licenses/by-sa/4.0/}
 * @see      {@link https://oxayaza.page.link/gitHub_aCounters}
 * @see      {@link https://codepen.io/OXAYAZA/pen/JJryqW}
 * @see      {@link https://oxayaza.page.link/linkedin}
 */
( function () {
	/**
	 * Создание случайного идентификатора
	 * @param {number} length - длинна идентификатора
	 * @return {string}
	 */
	function uId ( length ) {
		var uId = '';
		for ( var i = 0; i < length; i++ ) uId += String.fromCharCode( 97 + Math.random() * 25 );
		return uId;
	}

	function objectTag ( data ) {
		return Object.prototype.toString.call( data ).slice( 8, -1 );
	}

	/**
	 * Слияние обьектов
	 * @param {Object} source
	 * @param {Object} merged
	 * @return {Object}
	 */
	function merge( source, merged ) {
		for ( let key in merged ) {
			if ( objectTag( merged[ key ] ) === 'Object' ) {
				if ( typeof( source[ key ] ) !== 'object' ) source[ key ] = {};
				source[ key ] = merge( source[ key ], merged[ key ] );
			} else {
				source[ key ] = merged[ key ];
			}
		}

		return source;
	}

	/**
	 * @param data
	 * @constructor
	 */
	function ProgressCircle( data ) {
		// Проверка наличия обязательных параметров
		if ( !data || !data.node ) throw Error( 'Missing required αProgressCircle parameters (node).' );

		// Слияние стандартных и полученных параметров
		this.params= {};
		merge( this.params, ProgressCircle.defaults );
		merge( this.params, data );

		// Служебные параметры
		this.internal = {
			viewBox: [ 0, 0, 100, 100 ],
			ellipse: {
				rx: 72,
				ry: 72,
				cx: 50,
				cy: 50
			},
			x:        0,
			y:        0,
			clipped:  null,
			clipPath: null,
			path:     null,
			pathD:    ''
		};

		// Создание уникального идентификатора
		if ( !this.params.clipId ) this.params.clipId = uId( 8 );

		// Добавление ссылки на прототип в элемент
		this.params.node.progressCircle = this;

		// Добавление элемента clipPath в svg
		this.internal.clipPath = document.createElementNS( 'http://www.w3.org/2000/svg', 'clipPath' );
		this.internal.clipPath.id = this.params.clipId;
		this.params.node.appendChild( this.internal.clipPath );

		// Добавление элемента path в clipPath
		this.internal.path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
		this.internal.path.setAttribute( 'd', this.internal.pathD );
		this.internal.clipPath.appendChild( this.internal.path );

		// Добавление атрибута 'clip-path' к обрезаемому элементу
		this.internal.clipped = this.params.node.querySelector( this.params.clipped );
		this.internal.clipped.setAttribute( 'clip-path', 'url(#'+ this.params.clipId +')' );

		// Определение параметров svg и еллипса
		this.internal.viewBox = this.params.node.getAttribute( 'viewBox' ).split( ' ' ).map( function( value ) { return parseFloat( value ) } );
		this.internal.ellipse.rx = this.internal.viewBox[2]/2 * 1.44;
		this.internal.ellipse.ry = this.internal.viewBox[3]/2 * 1.44;
		this.internal.ellipse.cx = this.internal.viewBox[0] + this.internal.viewBox[2]/2;
		this.internal.ellipse.cy = this.internal.viewBox[1] + this.internal.viewBox[3]/2;

		this.render( this.params.angle );
	}

	// Параметры по умолчанию
	ProgressCircle.defaults = {
		node:    null,
		clipped: '.clipped',
		clipId:  null,
		angle:   0
	};

	ProgressCircle.prototype.calc = function() {
		this.internal.x = Math.sin( this.params.angle * Math.PI/180 ) * this.internal.ellipse.rx + this.internal.ellipse.cx;
		this.internal.y = -Math.cos( this.params.angle * Math.PI/180 ) * this.internal.ellipse.ry + this.internal.ellipse.cy;
	};

	ProgressCircle.prototype.genPath = function() {
		if ( this.params.angle >= -360 && this.params.angle < -180 ) {
			this.internal.pathD =
				'M '+ this.internal.ellipse.cx +' '+ this.internal.ellipse.cy +
				' L '+ this.internal.x +' '+ this.internal.y +
				' A '+ this.internal.ellipse.rx +' '+ this.internal.ellipse.ry +' 0 0 1 '+ this.internal.ellipse.cx +' '+ ( this.internal.ellipse.cy + this.internal.ellipse.ry ) +
				' A '+ this.internal.ellipse.rx +' '+ this.internal.ellipse.ry +' 0 0 1 '+ this.internal.ellipse.cx +' '+ ( this.internal.ellipse.cy - this.internal.ellipse.ry );
		} else if ( this.params.angle >= -180 && this.params.angle < 0 ) {
			this.internal.pathD =
				'M '+ this.internal.ellipse.cx +' '+ this.internal.ellipse.cy +
				' L '+ this.internal.x +' '+ this.internal.y +
				' A '+ this.internal.ellipse.rx +' '+ this.internal.ellipse.ry +' 0 0 1 '+ this.internal.ellipse.cx +' '+ ( this.internal.ellipse.cy - this.internal.ellipse.ry );
		} else if( this.params.angle >= 0 && this.params.angle < 180 ) {
			this.internal.pathD =
				'M '+ this.internal.ellipse.cx +' '+ this.internal.ellipse.cy +
				' L '+ this.internal.ellipse.cx +' '+ ( this.internal.ellipse.cy - this.internal.ellipse.ry ) +
				' A '+ this.internal.ellipse.rx +' '+ this.internal.ellipse.ry +' 0 0 1 ' + this.internal.x +' '+ this.internal.y;
		} else if( this.params.angle >= 180 && this.params.angle <= 360) {
			this.internal.pathD =
				'M '+ this.internal.ellipse.cx +' '+ this.internal.ellipse.cy +
				' L '+ this.internal.ellipse.cx +' '+ ( this.internal.ellipse.cy - this.internal.ellipse.ry ) +
				' A '+ this.internal.ellipse.rx +' '+ this.internal.ellipse.ry +' 0 0 1 '+ this.internal.ellipse.cx +' '+ ( this.internal.ellipse.cy + this.internal.ellipse.ry ) +
				' A '+ this.internal.ellipse.rx +' '+ this.internal.ellipse.ry +' 0 0 1 '+ this.internal.x +' '+ this.internal.y;
		} else {
			this.internal.pathD =
				'M '+ this.internal.ellipse.cx +' '+ ( this.internal.ellipse.cy - this.internal.ellipse.ry ) +
				' A '+ this.internal.ellipse.rx +' '+ this.internal.ellipse.ry +' 0 0 1 '+ this.internal.ellipse.cx +' '+ ( this.internal.ellipse.cy + this.internal.ellipse.ry ) +
				' A '+ this.internal.ellipse.rx +' '+ this.internal.ellipse.ry +' 0 0 1 '+ this.internal.ellipse.cx +' '+ ( this.internal.ellipse.cy - this.internal.ellipse.ry );
		}
	};

	ProgressCircle.prototype.render = function( angle ) {
		if ( typeof( angle ) === 'number' ) this.params.angle = angle;
		this.calc();
		this.genPath();
		this.internal.path.setAttribute( 'd', this.internal.pathD );		
	};

	if ( !window.ProgressCircle ) {
		window.ProgressCircle = ProgressCircle;
	} else {
		throw new Error( 'ProgressCircle variable is occupied' );
	}
})();
