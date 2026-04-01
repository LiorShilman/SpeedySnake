#if !defined(AFX_PLAYERNAMEDIALOG_H__084D1024_1400_11D3_B279_006097210C55__INCLUDED_)
#define AFX_PLAYERNAMEDIALOG_H__084D1024_1400_11D3_B279_006097210C55__INCLUDED_

#if _MSC_VER > 1000
#pragma once
#endif // _MSC_VER > 1000
// PlayerNameDialog.h : header file
//

/////////////////////////////////////////////////////////////////////////////
// CPlayerNameDialog dialog

class CPlayerNameDialog : public CDialog
{
// Construction
public:
	CPlayerNameDialog(CWnd* pParent = NULL);   // standard constructor

// Dialog Data
	//{{AFX_DATA(CPlayerNameDialog)
	enum { IDD = IDD_DIALOG_PLAYER };
	CString	m_strLavel;
	CString	m_strRama;
	CString	m_strScore;
	CString	m_strSpeed;
	CString	m_strName;
	//}}AFX_DATA


// Overrides
	// ClassWizard generated virtual function overrides
	//{{AFX_VIRTUAL(CPlayerNameDialog)
	protected:
	virtual void DoDataExchange(CDataExchange* pDX);    // DDX/DDV support
	//}}AFX_VIRTUAL

// Implementation
protected:

	// Generated message map functions
	//{{AFX_MSG(CPlayerNameDialog)
	virtual BOOL OnInitDialog();
	virtual void OnOK();
	//}}AFX_MSG
	DECLARE_MESSAGE_MAP()
};

//{{AFX_INSERT_LOCATION}}
// Microsoft Visual C++ will insert additional declarations immediately before the previous line.

#endif // !defined(AFX_PLAYERNAMEDIALOG_H__084D1024_1400_11D3_B279_006097210C55__INCLUDED_)
