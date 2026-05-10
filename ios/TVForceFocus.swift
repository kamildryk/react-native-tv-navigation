import Foundation
import React
import UIKit

@objc(TVForceFocus)
class TVForceFocus: NSObject {
  @objc var bridge: RCTBridge!
  @objc var viewRegistry_DEPRECATED: RCTViewRegistry!

  @objc
  static func requiresMainQueueSetup() -> Bool {
    true
  }

  @objc(requestFocus:)
  func requestFocus(_ reactTag: NSNumber) {
    DispatchQueue.main.async { [weak self] in
      guard let self else {
        return
      }

      if let viewRegistry = self.viewRegistry_DEPRECATED {
        viewRegistry.addUIBlock { [weak self] registry in
          guard let registry else {
            return
          }

          guard let view = registry.view(forReactTag: reactTag) else {
            return
          }

          self?.forceFocus(view)
        }

        return
      }

      guard let bridge = self.bridge else {
        return
      }

      bridge.uiManager.addUIBlock { [weak self] _, viewRegistry in
        guard let view = viewRegistry?[reactTag] as? UIView else {
          return
        }

        self?.forceFocus(view)
      }
    }
  }

  private func forceFocus(_ view: UIView) {
    #if os(tvOS)
    let requestFocusSelf = NSSelectorFromString("requestFocusSelf")

    if view.responds(to: requestFocusSelf) {
      view.perform(requestFocusSelf)
      return
    }

    if forceFocusThroughReactRoot(view) {
      return
    }

    if let focusSystem = UIFocusSystem.focusSystem(for: view) {
      focusSystem.requestFocusUpdate(to: view)
      focusSystem.updateFocusIfNeeded()
    } else {
      view.setNeedsFocusUpdate()
      view.updateFocusIfNeeded()
      view.window?.setNeedsFocusUpdate()
      view.window?.updateFocusIfNeeded()
    }
    #endif
  }

  private func forceFocusThroughReactRoot(_ view: UIView) -> Bool {
    #if os(tvOS)
    let setPreferredFocusedView = NSSelectorFromString("setReactPreferredFocusedView:")
    var current: UIView? = view

    while let candidate = current {
      if candidate.responds(to: setPreferredFocusedView) {
        candidate.perform(setPreferredFocusedView, with: view)
        candidate.setNeedsFocusUpdate()
        candidate.updateFocusIfNeeded()
        return true
      }

      current = candidate.superview
    }
    #endif

    return false
  }
}
