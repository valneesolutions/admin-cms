import React from 'react'

export default function Loading() {
  return (
    <div className="admin-loader-container">
      <div className="admin-loader-spinner-wrapper">
        <div className="admin-loader-spinner" />
        <img
          src="/valneeLogo.svg"
          alt="Valnee Logo"
          className="admin-loader-logo"
        />
      </div>
      <div className="admin-loader-text">Loading...</div>
    </div>
  )
}
