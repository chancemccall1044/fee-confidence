# Fee Confidence — User Guide

Fee Confidence estimates the fully burdened cost and fee for a labor-based contract. It turns direct labor, indirect rates, and a fee percentage into a cost stack, fee dollars, derived contract value, and effective margin. You can also compare up to three scenarios side by side.

## Get started

1. Open the app, enter your name and the passcode provided by your administrator, then select **Unlock**.
2. Give Scenario A a unique, descriptive name.
3. Select a contract type: **CPFF** or **TM**.
4. Enter the assumptions:
   - **Direct Labor ($):** labor cost in dollars.
   - **Fringe, Overhead, G&A, and Fee (%):** enter percentages as displayed values—for example, enter `28.5` for 28.5%, not `0.285`.
5. Review the results. They update automatically as you type.

## Read the results

- **Cost Stack** shows direct labor and each added indirect cost through total cost.
- **Fee Analysis** shows the fee amount, total contract value, and effective margin.
- **Canonical Output (CDOO JSON)** exposes the complete calculated record for auditing or copying into another system.

Currency is calculated and rounded to cents at each step. In the current model, CPFF and TM are reporting labels and use the same calculation.

## Compare scenarios

Select **+ B**, **+ C**, or **Add Scenario** to create alternatives based on Scenario A. Use the **A**, **B**, and **C** buttons to switch scenarios and edit their assumptions. Each scenario must have a unique name.

When more than one scenario exists, the results become a comparison table. Values beneath Scenarios B and C show the change from Scenario A. Use **− B** or **− C** to remove an alternative.

## Good to know

- Correct any highlighted input before relying on the results. If an entry is invalid, the app may dim the previous valid result and display an error.
- Scenarios are not saved after a page refresh, and the app does not currently import or export files.
- Select **Log Out** when you finish, especially on a shared device.
