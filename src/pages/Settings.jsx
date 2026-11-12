
import { useState } from 'react'
import { Save, CheckCircle2 } from 'lucide-react'

import SettingsHeader from '../components/settings/SettingsHeader'
import ProfileSettings from '../components/settings/ProfileSettings'
import PreferenceSettings from '../components/settings/PreferenceSettings'

function Settings() {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 2500)
  }

  return (
    <div className="space-y-8">
      <SettingsHeader />

      <div className="space-y-6">
        <ProfileSettings />
        <PreferenceSettings />
      </div>

      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h3 className="font-semibold text-gray-900">
            Lưu cài đặt
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Hoàn tất tùy chỉnh giao diện cài đặt.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          {saved ? (
            <>
              <CheckCircle2 size={18} />
              Đã lưu
            </>
          ) : (
            <>
              <Save size={18} />
              Lưu thay đổi
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default Settings
