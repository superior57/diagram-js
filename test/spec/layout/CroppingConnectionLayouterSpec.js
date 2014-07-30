'use strict';

var TestHelper = require('../../TestHelper');

/* global bootstrapDiagram, inject */


var Matchers = require('../../Matchers');


var layoutModule = {
  layouter: [ 'type', require('../../../lib/layout/CroppingConnectionLayouter') ]
};


function mid(shape) {
  return {
    x: shape.x + shape.width / 2,
    y: shape.y + shape.height / 2
  };
}

describe('features/layout/CroppingConnectionLayouter', function() {

  beforeEach(bootstrapDiagram({ modules: [ layoutModule ] }));

  beforeEach(Matchers.addDeepEquals);


  var topLeftShape,
      bottomRightShape,
      bottomLeftShape,
      topLeft_bottomLeftConnection,
      bottomLeft_bottomRightConnection,
      topLeft_bottomRightConnection,
      unconnectedConnection;

  beforeEach(inject(function(canvas) {

    topLeftShape = canvas.addShape({
      id: 's-topLeft',
      x: 100, y: 100,
      width: 100, height: 100
    });

    bottomLeftShape = canvas.addShape({
      id: 's-bottomLeft',
      x: 100, y: 400,
      width: 100, height: 100
    });

    bottomRightShape = canvas.addShape({
      id: 's-bottomRight',
      x: 400, y: 400,
      width: 100, height: 100
    });

    function createConnection(id, startShape, endShape) {

      return canvas.addConnection({
        id: id,
        waypoints: [ mid(startShape), mid(endShape) ],
        source: startShape,
        target: endShape
      });
    }

    topLeft_bottomLeftConnection = createConnection('c-topLeft-bottomLeft', topLeftShape, bottomLeftShape);
    topLeft_bottomRightConnection = createConnection('c-topLeft-bottomRight', topLeftShape, bottomRightShape);
    bottomLeft_bottomRightConnection = createConnection('c-bottomLeft-bottomRight', bottomLeftShape, bottomRightShape);

    unconnectedConnection = canvas.addConnection({
      id: 'c-unconnected',
      waypoints: [ { x: 130, y: 210 }, { x: 130, y: 390 } ],
      source: topLeftShape,
      target: bottomLeftShape
    });

  }));


  describe('#getDockingPoint', function() {

    it('should compute docking points', inject(function(layouter, canvas) {

      function expectDockingPoint(connection, shape, expected) {
        var dockingPoint = layouter.getDockingPoint(connection, shape);

        canvas._paper.circle(dockingPoint.actual.x, dockingPoint.actual.y, 4);

        expect(dockingPoint).toDeepEqual(expected);
      }

      // vertical source docking
      expectDockingPoint(topLeft_bottomLeftConnection, topLeft_bottomLeftConnection.source, {
        point : { x: 150, y: 150 },
        actual : { x : 150, y : 200 },
        idx : 0
      });

      // vertical target docking
      expectDockingPoint(topLeft_bottomLeftConnection, topLeft_bottomLeftConnection.target, {
        point : { x : 150, y : 450 },
        actual : { x : 150, y : 400 },
        idx : 1
      });

      // horizontal source docking
      expectDockingPoint(bottomLeft_bottomRightConnection, bottomLeft_bottomRightConnection.source, {
        point : { x : 150, y : 450 },
        actual : { x : 200, y : 450 },
        idx : 0
      });

      // vertical target docking
      expectDockingPoint(bottomLeft_bottomRightConnection, bottomLeft_bottomRightConnection.target, {
        point : { x : 450, y : 450 },
        actual : { x : 400, y : 450 },
        idx : 1
      });

      // diagonal source docking
      expectDockingPoint(topLeft_bottomRightConnection, topLeft_bottomRightConnection.source, {
        point : { x : 150, y : 150 },
        actual : { x : 197, y : 197 },
        idx : 0
      });

      // vertical target docking
      expectDockingPoint(topLeft_bottomRightConnection, topLeft_bottomRightConnection.target, {
        point : { x : 450, y : 450 },
        actual : { x : 403, y : 403 },
        idx : 1
      });
    }));


    it('should fallback if no intersection', inject(function(layouter, canvas) {

      function expectDockingPoint(connection, shape, expected) {
        var dockingPoint = layouter.getDockingPoint(connection, shape);

        canvas._paper.circle(dockingPoint.actual.x, dockingPoint.actual.y, 4);

        expect(dockingPoint).toDeepEqual(expected);
      }

      // non intersecting (source)
      expectDockingPoint(unconnectedConnection, unconnectedConnection.source, {
        point : unconnectedConnection.waypoints[0],
        actual : unconnectedConnection.waypoints[0],
        idx : 0
      });

      // non intersecting (target)
      expectDockingPoint(unconnectedConnection, unconnectedConnection.target, {
        point : unconnectedConnection.waypoints[1],
        actual : unconnectedConnection.waypoints[1],
        idx : 1
      });
    }));

  });


  describe('#getCroppedWaypoints', function() {

    it('should crop connection', inject(function(layouter) {

      // vertical connection
      expect(layouter.getCroppedWaypoints(topLeft_bottomLeftConnection)).toDeepEqual([
        { x: 150, y: 200, original: topLeft_bottomLeftConnection.waypoints[0] },
        { x: 150, y: 400, original: topLeft_bottomLeftConnection.waypoints[1]  }
      ]);

      expect(layouter.getCroppedWaypoints(bottomLeft_bottomRightConnection)).toDeepEqual([
        { x: 200, y: 450, original: bottomLeft_bottomRightConnection.waypoints[0] },
        { x: 400, y: 450, original: bottomLeft_bottomRightConnection.waypoints[1] }
      ]);

      expect(layouter.getCroppedWaypoints(topLeft_bottomRightConnection)).toDeepEqual([
        { x: 197, y: 197, original: topLeft_bottomRightConnection.waypoints[0] },
        { x: 403, y: 403, original: topLeft_bottomRightConnection.waypoints[1] }
      ]);

      // unconnected connection
      expect(layouter.getCroppedWaypoints(unconnectedConnection)).toDeepEqual([
        { x: 130, y: 210, original: unconnectedConnection.waypoints[0] },
        { x: 130, y: 390, original: unconnectedConnection.waypoints[1] }
      ]);

    }));

  });
});