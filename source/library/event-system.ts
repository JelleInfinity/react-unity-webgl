import { IUnityContextEventMap } from "../interfaces/unity-context-event-map";

/**
 * An array of all instanciated Event Systems.
 */
const eventSystems = new Array<EventSystem>();

/**
 * Dispatches an event that has been registered to all event systems.
 * @global
 * @param {string} eventName the event's name
 * @param {any} parameters the event's parameters
 * @example window.dispatchReactUnityEvent("gameOver", 180);
 */
const dispatchReactUnityEvent = function (
  eventName: string,
  ...parameters: any
) {
  // This made should be made available to the global scope. When invoked, it
  // will dispatch the given event to all event systems.
  for (let eventSystem of eventSystems) {
    if (typeof eventSystem !== "undefined") {
      eventSystem.dispatchEvent(eventName, ...parameters);
    }
  }
};

/**
 * An event system.
 */
export class EventSystem {
  /**
   * The event map contains all the events that have been registered to the
   * event system as a key-value pair of event name and event listener.
   * @private
   * @readonly
   */
  private readonly eventMap = new Map<string, Function>();

  constructor() {
    // The event system will be pushed to the global list of event system
    // instances.
    eventSystems.push(this);
    // If we're running inside of a browser environment, some global properties
    // will be made available on the window allowing for Unity to communicate.
    if (typeof window !== "undefined") {
      // Register the global dispatch method.
      if (typeof window.dispatchReactUnityEvent === "undefined") {
        window.dispatchReactUnityEvent = dispatchReactUnityEvent;
      }
    }
  }

  /**
   * Registers an event to the system.
   * @public
   * @param {string} eventName the event's name
   * @param {Function} eventListener the event's function
   */
  public on<MapKey extends keyof IUnityContextEventMap | (string & {})>(
    eventName: keyof IUnityContextEventMap | (MapKey & {}),
    eventListener: (
      ...parameters: MapKey extends keyof IUnityContextEventMap
        ? IUnityContextEventMap[MapKey]
        : any
    ) => void
  ): void {
    // Adds the event to the event map.
    this.eventMap.set(eventName, eventListener);
  }

  /**
   * Removes all the Event Listeners with a specific Event Name.
   * @public
   * @param {string} eventName the event's name
   * @example unityContext.removeEventListener("progress");
   */
  public removeEventListener(eventName: string): void {
    // Remove the event from the event map.
    this.eventMap.delete(eventName);
  }

  /**
   * Removes all the Event Listeners.
   * @public
   * @example unityContext.removeAllEventListeners();
   */
  public removeAllEventListeners(): void {
    // Clear the event map.
    this.eventMap.clear();
  }

  /**
   * Dispatches an event that has been registered to the event system.
   * @public
   * @param {string} eventName the event's name
   * @param {any} parameters the event's parameters
   * @example unityContext.dispatchEventListener("gameOver", 180);
   */
  public dispatchEvent(eventName: string, ...parameters: any): void {
    const event = this.eventMap.get(eventName);
    if (typeof event !== "undefined") {
      event(...parameters);
    }
  }
}
