package com.tvforcefocus

import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.IllegalViewOperationException
import com.facebook.react.uimanager.UIManagerHelper

class TVForceFocusModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = NAME

  @ReactMethod
  fun requestFocus(reactTag: Int) {
    UiThreadUtil.runOnUiThread {
      try {
        val uiManager = UIManagerHelper.getUIManagerForReactTag(reactContext, reactTag)
          ?: return@runOnUiThread
        val view = uiManager.resolveView(reactTag)
          ?: return@runOnUiThread

        forceFocus(view)
      } catch (_: IllegalViewOperationException) {
        // The tag may belong to an unmounted view. In that case requestFocus is a no-op.
      } catch (_: RuntimeException) {
        // Keep this method safe for stale refs or views outside the current hierarchy.
      }
    }
  }

  private fun forceFocus(view: View) {
    view.isFocusable = true
    view.isFocusableInTouchMode = true

    if (view.isAttachedToWindow && view.requestFocus(View.FOCUS_DOWN)) {
      return
    }

    view.post {
      if (!view.isAttachedToWindow) {
        return@post
      }

      view.isFocusable = true
      view.isFocusableInTouchMode = true

      if (view.requestFocus(View.FOCUS_DOWN)) {
        return@post
      }

      requestFocusThroughAncestors(view)
    }
  }

  private fun requestFocusThroughAncestors(view: View): Boolean {
    var current: View? = view

    while (current != null) {
      current.isFocusable = true
      current.isFocusableInTouchMode = true

      if (current.requestFocus(View.FOCUS_DOWN)) {
        return true
      }

      val parent = current.parent
      current = parent as? View
    }

    return false
  }

  companion object {
    const val NAME = "TVForceFocus"
  }
}
